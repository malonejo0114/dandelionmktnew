"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const requiredFields = ["name", "phone", "industry", "challenge"] as const;

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitLead(
  _previousState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const missingField = requiredFields.find((field) => !readField(formData, field));
  const privacyConsent = formData.get("privacyConsent") === "on";

  if (missingField || !privacyConsent) {
    return {
      status: "error",
      message: "필수 항목과 개인정보 수집 동의를 확인해주세요.",
    };
  }

  const payload = {
    name: readField(formData, "name"),
    phone: readField(formData, "phone"),
    email: readField(formData, "email"),
    industry: readField(formData, "industry"),
    channel: readField(formData, "channel"),
    challenge: readField(formData, "challenge"),
    marketing_consent: formData.get("marketingConsent") === "on",
    source: "dandelion-effect-homepage",
  };

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase 환경변수가 아직 연결되지 않았습니다. .env.local 설정 후 다시 제출해주세요.",
    };
  }

  const table = process.env.SUPABASE_LEADS_TABLE ?? "leads";
  const { error } = await supabase.from(table).insert(payload);

  if (error) {
    return {
      status: "error",
      message: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  return {
    status: "success",
    message: "감사합니다. 내용을 검토한 후 빠르게 연락드리겠습니다.",
  };
}
