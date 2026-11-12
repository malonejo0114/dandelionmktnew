"use client";

import { useActionState } from "react";
import { submitLead, type LeadFormState } from "@/app/actions";
import { Reveal } from "@/components/paper/reveal";
import type { SiteContent } from "@/data/content";

/**
 * 06 문의 — A 편지지: 손편지 쓰듯 남기는 문의.
 * 저장은 기존 submitLead 그대로 (필드 이름 name/phone/email/industry/channel/challenge/privacyConsent/marketingConsent).
 */
const initialState: LeadFormState = { status: "idle", message: "" };

export function LetterContact({ cta, common }: { cta: SiteContent["cta"]; common: SiteContent["common"] }) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  return (
    <Reveal className="sec" id="cta">
      <div className="wrap s6">
        <div className="letter x rise" style={{ ["--d" as string]: 0 }}>
          <div className="to x fade" style={{ ["--d" as string]: 2 }}>
            To. {common.brandName}
          </div>
          <h2 className="x rise" style={{ ["--d" as string]: 3 }}>
            {cta.headline}
          </h2>
          <p className="lead x rise" style={{ ["--d" as string]: 4 }}>
            {cta.description}
          </p>

          <form action={formAction}>
            <Field id="name" en="Name" ko="이름" required autoComplete="name" placeholder="홍길동" d={5} />
            <Field id="phone" en="Phone" ko="연락처" required type="tel" autoComplete="tel" placeholder="010-0000-0000" d={5} />
            <Field id="email" en="Email" ko="이메일" type="email" autoComplete="email" placeholder="name@company.com" d={6} />
            <Field id="industry" en="Industry" ko="업종" required placeholder="예: 뷰티, 교육, 커머스" d={6} />
            <Field id="channel" en="Channels" ko="운영 채널" placeholder="Meta, Naver, Google 등" d={7} full />
            <div className="field full x rise" style={{ ["--d" as string]: 7 }}>
              <label htmlFor="challenge">
                Concern<span>현재 고민</span>
                <i aria-hidden="true">*</i>
              </label>
              <textarea
                id="challenge"
                name="challenge"
                required
                rows={4}
                placeholder="광고 계정, 랜딩, 문의DB, 콘텐츠 운영에서 가장 답답한 부분을 적어주세요."
              />
            </div>
            <label className="agree full" htmlFor="privacyConsent">
              <input id="privacyConsent" name="privacyConsent" type="checkbox" required />
              <span>상담 안내를 위한 개인정보 수집 및 이용에 동의합니다. (필수)</span>
            </label>
            <label className="agree full" htmlFor="marketingConsent">
              <input id="marketingConsent" name="marketingConsent" type="checkbox" />
              <span>마케팅 인사이트와 소식 수신에 동의합니다. 선택 항목입니다.</span>
            </label>
            <div className="from">
              <span className="script">From.</span>
              <button className="btn solid" type="submit" disabled={pending}>
                {pending ? "보내는 중…" : "무료 성장 진단 신청하기"}
              </button>
            </div>
            {state.message ? (
              <p className={`msg ${state.status === "success" ? "ok" : "err"}`} role="status">
                {state.message}
              </p>
            ) : null}
          </form>
        </div>

        {cta.compliance.length ? (
          <div className="notice x fade" style={{ ["--d" as string]: 9 }}>
            {cta.compliance.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}

function Field({
  id,
  en,
  ko,
  d,
  full,
  required,
  ...input
}: {
  id: string;
  en: string;
  ko: string;
  d: number;
  full?: boolean;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className={`field x rise ${full ? "full" : ""}`} style={{ ["--d" as string]: d }}>
      <label htmlFor={id}>
        {en}
        <span>{ko}</span>
        {required ? <i aria-hidden="true">*</i> : null}
      </label>
      <input id={id} name={id} required={required} {...input} />
    </div>
  );
}
