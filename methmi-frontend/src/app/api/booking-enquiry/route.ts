import { NextRequest, NextResponse } from "next/server";
import { bookingEnquirySchema } from "@/lib/validation";
import { BACKEND_URL, hasBackend } from "@/lib/api";

export const dynamic = "force-dynamic";

// Per-instance rate limiting. Use Redis or a provider-level limit if this ever
// runs on more than one process.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = bookingEnquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the form for errors and try again.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // With a backend configured, hand the enquiry over so it is emailed and
    // stored there. Standalone, log it and accept it — the visitor still gets
    // a confirmation and the WhatsApp CTA.
    if (hasBackend) {
      const upstream = await fetch(`${BACKEND_URL}/api/booking-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await upstream.json();
      return NextResponse.json(result, { status: upstream.status });
    }

    console.log("[booking-enquiry] New enquiry received:", parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[booking-enquiry] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We couldn't process your enquiry right now. Please try again or contact us on WhatsApp.",
      },
      { status: 500 },
    );
  }
}
