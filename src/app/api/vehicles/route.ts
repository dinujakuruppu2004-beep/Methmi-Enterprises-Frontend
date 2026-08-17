import { NextResponse } from "next/server";
import { getAllVehicles } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const vehicles = await getAllVehicles();
  return NextResponse.json({ vehicles });
}
