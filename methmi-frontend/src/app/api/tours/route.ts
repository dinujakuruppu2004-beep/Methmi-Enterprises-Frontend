import { NextResponse } from "next/server";
import { getAllTours } from "@/lib/api";

export const dynamic = "force-dynamic";

// Serves the browser the same content the server components use: the backend
// when BACKEND_URL is set, the bundled data in src/data otherwise.
export async function GET() {
  const tours = await getAllTours();
  return NextResponse.json({ tours });
}
