import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedAdminEmails().includes(email.toLowerCase());
}

/** 현재 세션의 인증·allowlist를 확인. 통과 시 email 반환, 아니면 null. */
export async function getAdminEmail(): Promise<string | null> {
  // Supabase 환경변수가 없으면 클라이언트 생성이 throw하므로 안전하게 null 반환.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAllowedAdmin(user?.email) ? user!.email! : null;
}
