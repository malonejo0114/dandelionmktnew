"use client";

import { useRef, useState } from "react";
import { createUploadUrl } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX = {
  video: 300 * 1024 * 1024, // 300MB
  poster: 10 * 1024 * 1024, // 10MB
} as const;

const ALLOWED = {
  video: ["video/mp4", "video/webm", "video/quicktime"],
  poster: ["image/jpeg", "image/png", "image/webp"],
} as const;

export function MediaUpload({
  kind, slug, value, onChange, accept,
}: {
  kind: "video" | "poster";
  slug: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    try {
      if (file.size > MAX[kind]) {
        setError(kind === "video" ? "영상이 너무 큽니다 (최대 300MB)." : "이미지가 너무 큽니다 (최대 10MB).");
        return;
      }
      if (file.type && !(ALLOWED[kind] as readonly string[]).includes(file.type)) {
        setError("지원하지 않는 형식입니다.");
        return;
      }
      const ext = file.name.split(".").pop() ?? "bin";
      // 1) 서버에서 서명 업로드 URL 발급 (파일 본문 없음 → 용량 제한 무관)
      const res = await createUploadUrl(slug || "case", kind, ext);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      // 2) 브라우저 → Supabase Storage 직접 업로드
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from("portfolio-media")
        .uploadToSignedUrl(res.path, res.token, file, { contentType: file.type });
      if (upErr) {
        setError("업로드 실패: " + upErr.message);
        return;
      }
      // 3) 공개 URL 저장
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(res.path);
      onChange(data.publicUrl);
    } catch {
      setError("업로드 실패 — 네트워크 문제일 수 있습니다. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="border border-[#343437] px-4 py-2 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A] disabled:opacity-60"
        >
          {busy ? "업로드 중…" : `${kind === "video" ? "영상" : "포스터"} 업로드`}
        </button>
        {value ? <span className="truncate font-kr text-xs text-[#8FA88A]">업로드됨</span> : <span className="font-kr text-xs text-[#8B8B86]">미설정(폴백 사용)</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      {kind === "poster" && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="poster preview" className="h-28 w-auto rounded border border-[#343437] object-cover" />
      ) : null}
      {error ? <p className="font-kr text-xs text-[#D96C63]">{error}</p> : null}
    </div>
  );
}
