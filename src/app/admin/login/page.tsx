"use client";

import { useActionState } from "react";
import { requestMagicLink, type AuthState } from "@/app/admin/actions";

const initial: AuthState = { status: "idle", message: "" };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18191B] px-5 text-[#F4EFE5]">
      <div className="w-full max-w-sm">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">Admin</p>
        <h1 className="mt-3 font-kr text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 font-kr text-sm text-[#8B8B86]">등록된 이메일로 로그인 링크를 보내드립니다.</p>
        <form action={action} className="mt-8 grid gap-4">
          <input
            type="email"
            name="email"
            required
            placeholder="you@dandelionmkt.co.kr"
            className="h-12 border border-[#343437] bg-[#111214] px-4 text-[#F4EFE5] placeholder:text-[#8B8B86] focus:border-[#D6B77A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-12 bg-[#D6B77A] font-display text-sm uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0] disabled:opacity-60"
          >
            {pending ? "발송 중…" : "로그인 링크 받기"}
          </button>
        </form>
        {state.message ? (
          <p className={`mt-4 font-kr text-sm ${state.status === "error" ? "text-[#D96C63]" : "text-[#8FA88A]"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
