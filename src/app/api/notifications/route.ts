import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

const expo = new Expo({
  useFcmV1: true,
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

const BFF_BASE =
  process.env.BFF_BASE_URL ||
  process.env.NEXT_PUBLIC_BFF_BASE_URL ||
  "http://localhost:8080";

const bodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  routeId: z.string().min(1),
  cityId: z.string().min(1)
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, content, routeId, cityId } = parsed.data;

  // Backend selects eligible recipients, calculates proximity and persists the record
  const prepareRes = await fetch(`${BFF_BASE}/bff/notifications/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, routeId, cityId }),
    cache: "no-store"
  });

  if (!prepareRes.ok) {
    const err = await prepareRes.text();
    return NextResponse.json(
      { error: err || `Backend error ${prepareRes.status}` },
      { status: prepareRes.status === 400 ? 400 : 502 }
    );
  }

  const payload = await prepareRes.json() as {
    id: string;
    tokens: string[];
    title: string;
    content: string;
    recipientCount: number;
  };

  const validTokens = (payload.tokens ?? []).filter(Expo.isExpoPushToken);

  if (validTokens.length > 0) {
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      title: payload.title,
      body: payload.content,
      priority: "high"
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error("Expo chunk send error:", err);
      }
    }

    // Mark notification as sent in the backend
    await fetch(`${BFF_BASE}/bff/notifications/${payload.id}/sent`, {
      method: "PATCH",
      cache: "no-store"
    }).catch((err) => console.error("markSent error:", err));
  }

  return NextResponse.json({ success: true, recipientCount: payload.recipientCount });
}
