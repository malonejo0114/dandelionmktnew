"use client";

import { useActionState } from "react";
import { signInWithPassword, type AuthState } from "@/app/admin/actions";

const initial: AuthState = { status: "idle", message: "" };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signInWithPassword, initial);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18191B] px-5 text-[#F4EFE5]">
      <div className="w-full max-w-sm">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">Admin</p>
        <h1 className="mt-3 font-kr text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 font-kr text-sm text-[#8B8B86]">등록된 이메일과 비밀번호로 로그인하세요.</p>
        <form action={action} className="mt-8 grid gap-4">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@dandelionmkt.co.kr"
            className="h-12 border border-[#343437] bg-[#111214] px-4 text-[#F4EFE5] placeholder:text-[#8B8B86] focus:border-[#D6B77A] focus:outline-none"
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="비밀번호"
            className="h-12 border border-[#343437] bg-[#111214] px-4 text-[#F4EFE5] placeholder:text-[#8B8B86] focus:border-[#D6B77A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-12 bg-[#D6B77A] font-display text-sm uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0] disabled:opacity-60"
          >
            {pending ? "로그인 중…" : "로그인"}
          </button>
        </form>
        {state.message ? (
          <p className="mt-4 font-kr text-sm text-[#D96C63]">{state.message}</p>
        ) : null}
      </div>
    </main>
  );
}
