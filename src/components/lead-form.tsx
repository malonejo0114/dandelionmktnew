"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { submitLead, type LeadFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: LeadFormState = {
  status: "idle",
  message: "",
};

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름" name="name" placeholder="조한진" required />
        <Field label="연락처" name="phone" placeholder="010-0000-0000" required />
        <Field label="이메일" name="email" placeholder="official@dandelionmkt.co.kr" />
        <Field label="업종" name="industry" placeholder="예: 뷰티, 교육, 커머스" required />
        <Field label="운영 채널" name="channel" placeholder="Meta, Naver, Google 등" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="challenge" className="text-xs text-[#E7D2A0]">
          현재 고민
        </Label>
        <Textarea
          id="challenge"
          name="challenge"
          required
          rows={5}
          placeholder="현재 광고 계정, 랜딩, 문의DB, 콘텐츠 운영에서 가장 답답한 부분을 적어주세요."
          className="min-h-32 rounded-none border-[#343437] bg-[#111214]/70 text-[#F4EFE5] placeholder:text-[#8B8B86] focus-visible:border-[#D6B77A] focus-visible:ring-[#D6B77A]/20"
        />
      </div>

      <div className="grid gap-3 text-sm text-[#A9A49B]">
        <label className="flex items-start gap-3">
          <input
            required
            name="privacyConsent"
            type="checkbox"
            className="mt-1 size-4 appearance-none border border-[#D6B77A] bg-transparent checked:bg-[#D6B77A]"
          />
          <span>상담 안내를 위한 개인정보 수집 및 이용에 동의합니다.</span>
        </label>
        <label className="flex items-start gap-3">
          <input
            name="marketingConsent"
            type="checkbox"
            className="mt-1 size-4 appearance-none border border-[#5B5650] bg-transparent checked:bg-[#D6B77A]"
          />
          <span>마케팅 인사이트와 소식 수신에 동의합니다. 선택 항목입니다.</span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-13 rounded-none border border-[#D6B77A] bg-[#D6B77A] px-6 text-[#111214] hover:bg-[#E7D2A0] disabled:opacity-60"
      >
        {pending ? "접수 중" : "무료 성장 진단 신청하기"}
        <ArrowUpRight className="ml-2 size-4" />
      </Button>

      <AnimatePresence mode="popLayout">
        {state.message ? (
          <motion.p
            key={state.message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={
              state.status === "success"
                ? "border border-[#8FA88A]/40 bg-[#8FA88A]/10 p-4 text-sm text-[#DDEBD8]"
                : "border border-[#D96C63]/40 bg-[#D96C63]/10 p-4 text-sm text-[#F2C8C3]"
            }
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-xs text-[#E7D2A0]">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-12 rounded-none border-[#343437] bg-[#111214]/70 text-[#F4EFE5] placeholder:text-[#8B8B86] focus-visible:border-[#D6B77A] focus-visible:ring-[#D6B77A]/20"
      />
    </div>
  );
}
