"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaUpload } from "@/components/admin/media-upload";
import type { Faq } from "@/lib/posts";

export type PostFormValues = {
  slug: string; title: string; category: string; status: string; excerpt: string;
  coverUrl: string; contentHtml: string; summary: string; faqs: Faq[];
  seoTitle: string; seoDescription: string; readingTime: string;
};

const empty: PostFormValues = {
  slug: "", title: "", category: "Marketing", status: "draft", excerpt: "",
  coverUrl: "", contentHtml: "", summary: "", faqs: [{ q: "", a: "" }],
  seoTitle: "", seoDescription: "", readingTime: "5 min read",
};

function Field({ label, name, def, ta }: { label: string; name: string; def?: string; ta?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">{label}</span>
      {ta ? (
        <textarea name={name} defaultValue={def} rows={2} className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      ) : (
        <input name={name} defaultValue={def} className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      )}
    </label>
  );
}

export function PostEditor({ action, initial }: { action: (fd: FormData) => void; initial?: PostFormValues }) {
  const init = initial ?? empty;
  const [slug, setSlug] = useState(init.slug);
  const [cover, setCover] = useState(init.coverUrl);
  const [html, setHtml] = useState(init.contentHtml);
  const [faqs, setFaqs] = useState<Faq[]>(init.faqs.length ? init.faqs : [{ q: "", a: "" }]);

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">Slug</span>
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
        </label>
        <Field label="제목" name="title" def={init.title} />
        <Field label="카테고리" name="category" def={init.category} />
        <Field label="읽기 시간" name="reading_time" def={init.readingTime} />
      </div>
      <Field label="요약/목록 설명(excerpt)" name="excerpt" def={init.excerpt} ta />

      <div>
        <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">대표 이미지</p>
        <MediaUpload kind="poster" slug={slug} value={cover} onChange={setCover} accept="image/*" />
        <input type="hidden" name="cover_url" value={cover} />
      </div>

      <div>
        <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">본문</p>
        <RichTextEditor slug={slug} initialHtml={init.contentHtml} onChange={setHtml} />
        <input type="hidden" name="content_html" value={html} />
      </div>

      <Field label="TL;DR 요약(검색·AI용)" name="summary" def={init.summary} ta />

      <div className="grid gap-3">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">FAQ (Q&A)</p>
        {faqs.map((f, i) => (
          <div key={i} className="grid gap-2 border border-[#343437] p-3">
            <div className="flex items-center justify-between gap-3">
              <input name="faq_q" defaultValue={f.q} placeholder="질문" className="h-10 flex-1 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
              <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="text-[#D96C63]">삭제</button>
            </div>
            <textarea name="faq_a" defaultValue={f.a} rows={2} placeholder="답변" className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
          </div>
        ))}
        <button type="button" onClick={() => setFaqs([...faqs, { q: "", a: "" }])} className="justify-self-start border border-[#343437] px-4 py-2 font-display text-xs uppercase tracking-[0.16em] text-[#D6B77A] hover:bg-[#D6B77A] hover:text-[#111214]">+ FAQ 추가</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SEO 제목(비면 제목 사용)" name="seo_title" def={init.seoTitle} />
        <Field label="SEO 설명(비면 excerpt 사용)" name="seo_description" def={init.seoDescription} ta />
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="status" value="published" defaultChecked={init.status === "published"} className="size-4 accent-[#D6B77A]" />
        <span className="font-kr text-sm text-[#F4EFE5]">게시(체크 해제 시 임시저장)</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="bg-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">저장</button>
        <a href="/admin/blog" className="border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A]">취소</a>
      </div>
    </form>
  );
}
