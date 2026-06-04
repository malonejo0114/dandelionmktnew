import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("ref");
  const path = request.nextUrl.searchParams.get("path") ?? "/";
  const res = new NextResponse(null, { status: 204 });
  if (!code) return res;
  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|facebookexternalhit/i.test(ua)) return res;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("link_visits").insert({ code, path });
  }
  res.cookies.set("ref", code, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  return res;
}
