import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { RouteEntity } from "@/common/entities/route";
import { getRoute } from "@/store/services/route";
import { getAllCitizens } from "@/store/services/user";
import { decodePolyline, getDistanceBetweenTwoPoints } from "@/utils/location";
import { getAllWithdrawalsRequests } from "@/store/services/withdrawalsRequests";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";
import {
  canActOnCity,
  forwardedAuthHeaders,
  requireRole
} from "@/utils/serverSession";

const expo = new Expo({
  useFcmV1: true,
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

const bodySchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(500),
  routeId: z.string().min(1),
  cityId: z.string().min(1)
});

export async function POST(request: Request) {
  // Sem autenticacao, qualquer pessoa podia disparar push para os cidadaos de uma cidade.
  const session = await requireRole(request, [
    "VEHICLE",
    "ADMIN",
    "PLATFORM_ADMIN"
  ]);
  if ("response" in session) return session.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { content, title, routeId, cityId } = parsed.data;

  if (!canActOnCity(session.user, cityId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const messages: ExpoPushMessage[] = [];

  // As chamadas ao backend rodam no servidor: repassam as credenciais do chamador.
  const init: RequestInit = { headers: forwardedAuthHeaders(request) };
  const users = await getAllCitizens(cityId, init);
  const routeResponse = await getRoute(routeId, init);
  const withdrawalRequests = (await getAllWithdrawalsRequests(
    cityId,
    init
  )) as WithdrawalsRequestEntity[];

  if ("error" in routeResponse && routeResponse.error) {
    return NextResponse.json(
      {},
      {
        status: 400
      }
    );
  }

  const route = routeResponse as RouteEntity;

  const polylineCoordinates = decodePolyline(route.polyline || "").map(
    ([latitude, longitude]) => ({ latitude, longitude })
  );

  const usersCloseToRoute = users.filter((user) => {
    const dir = polylineCoordinates.find(
      (item) =>
        getDistanceBetweenTwoPoints(
          {
            lat: Number(user.latitude),
            lng: Number(user.longitude)
          },
          {
            lat: item.latitude,
            lng: item.longitude
          }
        ) <= 0.1
    );

    return dir;
  });

  if (withdrawalRequests && route.isSpecial) {
    const withdrawalRequestInRoute = withdrawalRequests.filter((item) =>
      (route.withdrawalRequestsIds ?? []).includes(item.id)
    );

    const usersWithWithdrawalRequests = users.filter((item) =>
      withdrawalRequestInRoute
        .map((withdrawal) => withdrawal.createdById)
        .includes(item.id)
    );

    usersCloseToRoute.push(...usersWithWithdrawalRequests);
  }

  for (const user of usersCloseToRoute) {
    for (const token of user.tokens ?? []) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token $${token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: token,
        body: content,
        title,
        priority: "high"
      });
    }
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }

  return NextResponse.json(
    {
      success: true
    },
    {
      status: 200
    }
  );
}
