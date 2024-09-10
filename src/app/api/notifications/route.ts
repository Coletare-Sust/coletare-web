import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRoute } from "@/store/services/route";
import { getAllCitizens } from "@/store/services/user";
import { decodePolyline, getDistanceBetweenTwoPoints } from "@/utils/location";
import { getAllWithdrawalsRequests } from "@/store/services/withdrawalsRequests";
import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";

const expo = new Expo({
  useFcmV1: true,
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

const bodySchema = z.object({
  title: z.string(),
  content: z.string(),
  routeId: z.string(),
  cityId: z.string()
});

export async function POST(request: Request) {
  const body = await request.json();

  const { content, title, routeId, cityId } = bodySchema.parse(body);

  const messages: ExpoPushMessage[] = [];

  const users = await getAllCitizens(cityId);
  const route = await getRoute(routeId);
  const withdrawalRequests = (await getAllWithdrawalsRequests(
    cityId
  )) as WithdrawalsRequestEntity[];

  if (route.error) {
    return Response.json(
      {},
      {
        status: 400
      }
    );
  }

  const polylineCoordinates = decodePolyline(route.polyline).map(
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
