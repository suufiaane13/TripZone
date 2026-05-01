/**
 * Notification Telegram pour nouvelles réservations.
 *
 * Déclenchement recommandé : Supabase Dashboard → Database → Webhooks
 *   - Table: public.reservations
 *   - Events: INSERT
 *   - URL: https://<PROJECT_REF>.supabase.co/functions/v1/notify-telegram
 *   - HTTP Headers: Authorization: Bearer <SERVICE_ROLE_KEY>  (optionnel si verify_jwt=false et pas d’auth)
 *   - Ou header custom X-Notify-Secret si NOTIFY_WEBHOOK_SECRET est défini (secrets).
 *
 * Secrets (Dashboard → Edge Functions → Secrets, ou `supabase secrets set`) :
 *   TELEGRAM_BOT_TOKEN   — depuis @BotFather
 *   TELEGRAM_CHAT_ID     — ton id ou celui du groupe (getUpdates ou @userinfobot)
 *   SERVICE_ROLE_KEY — même valeur que la clé « service_role » (Dashboard → API).
 *     (Impossible d’utiliser le nom SUPABASE_SERVICE_ROLE_KEY en secret personnalisé.)
 *   NOTIFY_WEBHOOK_SECRET — si défini, la requête doit inclure X-Notify-Secret: <valeur>,
 *     sauf pour le corps JSON { "reservation_id": "<uuid>" } (appel navigateur après réservation :
 *     la ligne est rechargée en base avec la service role).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const TELEGRAM_API = "https://api.telegram.org";

type DbWebhookPayload = {
  type?: string;
  table?: string;
  record?: {
    id: string;
    trip_id: string;
    full_name: string;
    phone: string;
    persons: number;
    status?: string;
    created_at?: string;
  };
};

const corsHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notify-secret",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, x-notify-secret",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: DbWebhookPayload & { reservation_id?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const clientNotifyById =
    typeof payload.reservation_id === "string" &&
    payload.reservation_id.length > 0 &&
    !payload.record;

  const secret = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
  if (secret) {
    const sent = req.headers.get("x-notify-secret");
    if (sent !== secret && !clientNotifyById) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey =
    Deno.env.get("SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  let row = payload.record;

  if (clientNotifyById) {
    if (!supabaseUrl || !serviceKey) {
      console.error("SERVICE_ROLE_KEY needed for reservation_id notify path");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: resRow, error: resErr } = await supabase
      .from("reservations")
      .select("id, trip_id, full_name, phone, persons, status, created_at")
      .eq("id", payload.reservation_id!)
      .maybeSingle();

    if (resErr || !resRow) {
      return jsonResponse({ error: "Reservation not found" }, 404);
    }

    const created = new Date(resRow.created_at as string).getTime();
    const maxAgeMs = 15 * 60 * 1000;
    if (Number.isNaN(created) || Date.now() - created > maxAgeMs) {
      return jsonResponse({ error: "Reservation too old or invalid" }, 400);
    }

    row = {
      id: resRow.id as string,
      trip_id: resRow.trip_id as string,
      full_name: resRow.full_name as string,
      phone: resRow.phone as string,
      persons: resRow.persons as number,
      status: resRow.status as string,
      created_at: resRow.created_at as string,
    };
  }

  if (!row?.trip_id || !row.full_name) {
    return jsonResponse({ error: "Missing record in payload" }, 400);
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!botToken || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  let tripTitle = "Trajet inconnu";

  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: trip } = await supabase
      .from("trips")
      .select("title, date, departure_time")
      .eq("id", row.trip_id)
      .maybeSingle();
    if (trip?.title) {
      tripTitle = trip.title as string;
      if (trip.date) tripTitle += ` (${trip.date})`;
    }
  }

  const lines = [
    "<b>🚌 Nouvelle réservation TripZone</b>",
    "",
    `<b>Trajet :</b> ${escapeHtml(tripTitle)}`,
    `<b>Nom :</b> ${escapeHtml(row.full_name)}`,
    `<b>Téléphone :</b> ${escapeHtml(row.phone)}`,
    `<b>Personnes :</b> ${row.persons}`,
    `<b>Statut :</b> ${escapeHtml(row.status ?? "pending")}`,
    "",
    `<i>ID réservation : ${row.id}</i>`,
  ];

  const text = lines.join("\n");

  const tgUrl = `${TELEGRAM_API}/bot${botToken}/sendMessage`;
  const tgRes = await fetch(tgUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const tgBody = await tgRes.json().catch(() => ({}));

  if (!tgRes.ok) {
    console.error("Telegram API error:", tgRes.status, tgBody);
    return jsonResponse(
      { ok: false, telegram: tgBody },
      502,
    );
  }

  return jsonResponse({ ok: true, telegram_message_id: tgBody?.result?.message_id }, 200);
});

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
