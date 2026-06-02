"use client";

import { useRef, useState } from "react";
import { uploadMedia, type UploadResult } from "@/app/admin/actions";

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
    setBusy(true); setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("slug", slug || "case");
    fd.set("kind", kind);
    const res: UploadResult = await uploadMedia(fd);
    setBusy(false);
    if ("url" in res) onChange(res.url);
    else setError(res.error);
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
