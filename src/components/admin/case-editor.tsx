"use client";

import { useState } from "react";
import Link from "next/link";
import { MediaUpload } from "@/components/admin/media-upload";
import type { CaseDetailBlock } from "@/lib/portfolio";

type DetailItem = { id: string; heading: string; body: string };
const newId = () => Math.random().toString(36).slice(2);

export type CaseFormValues = {
  slug: string; industry: string; title: string; problem: string; strategy: string;
  result: string; duration: string; summary: string; detail: CaseDetailBlock[];
  published: boolean; sort_order: number; video_url: string; poster_url: string;
};

const empty: CaseFormValues = {
  slug: "", industry: "", title: "", problem: "", strategy: "", result: "", duration: "",
  summary: "", detail: [{ heading: "", body: "" }], published: true, sort_order: 0, video_url: "", poster_url: "",
};

function Field({ label, name, defaultValue, textarea }: { label: string; name: string; defaultValue?: string; textarea?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={3} className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      ) : (
        <input name={name} defaultValue={defaultValue} className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      )}
    </label>
  );
}

export function CaseEditor({
  action, initial,
}: {
  action: (formData: FormData) => void;
  initial?: CaseFormValues;
}) {
  const init = initial ?? empty;
  const [slug, setSlug] = useState(init.slug);
  const [detail, setDetail] = useState<DetailItem[]>(
    (init.detail.length ? init.detail : [{ heading: "", body: "" }]).map((d) => ({ id: newId(), heading: d.heading, body: d.body })),
  );
  const [videoUrl, setVideoUrl] = useState(init.video_url);
  const [posterUrl, setPosterUrl] = useState(init.poster_url);

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">Slug</span>
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
        </label>
        <Field label="Industry(업종)" name="industry" defaultValue={init.industry} />
        <Field label="Title(제목)" name="title" defaultValue={init.title} />
        <Field label="Result(결과)" name="result" defaultValue={init.result} />
        <Field label="Duration(기간)" name="duration" defaultValue={init.duration} />
        <Field label="Sort order" name="sort_order" defaultValue={String(init.sort_order)} />
      </div>
      <Field label="Problem" name="problem" defaultValue={init.problem} textarea />
      <Field label="Strategy" name="strategy" defaultValue={init.strategy} textarea />
      <Field label="Summary(상세 요약)" name="summary" defaultValue={init.summary} textarea />

      <div className="grid gap-3">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">상세 글 블록</p>
        {detail.map((block) => (
          <div key={block.id} className="grid gap-2 border border-[#343437] p-3">
            <div className="flex items-center justify-between">
              <input
                name="detail_heading"
                defaultValue={block.heading}
                placeholder="소제목"
                className="h-10 flex-1 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none"
              />
              <button type="button" onClick={() => setDetail(detail.filter((d) => d.id !== block.id))} className="ml-3 text-[#D96C63]">삭제</button>
            </div>
            <textarea name="detail_body" defaultValue={block.body} rows={3} placeholder="본문" className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
          </div>
        ))}
        <button type="button" onClick={() => setDetail([...detail, { id: newId(), heading: "", body: "" }])} className="justify-self-start border border-[#343437] px-4 py-2 font-display text-xs uppercase tracking-[0.16em] text-[#D6B77A] hover:bg-[#D6B77A] hover:text-[#111214]">
          + 블록 추가
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">영상</p>
          <MediaUpload kind="video" slug={slug} value={videoUrl} onChange={setVideoUrl} accept="video/mp4" />
          <input type="hidden" name="video_url" value={videoUrl} />
        </div>
        <div>
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">포스터</p>
          <MediaUpload kind="poster" slug={slug} value={posterUrl} onChange={setPosterUrl} accept="image/*" />
          <input type="hidden" name="poster_url" value={posterUrl} />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="published" defaultChecked={init.published} className="size-4 accent-[#D6B77A]" />
        <span className="font-kr text-sm text-[#F4EFE5]">게시</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="bg-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">저장</button>
        <Link href="/admin/portfolio" className="border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A]">취소</Link>
      </div>
    </form>
  );
}
