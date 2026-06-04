"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";
import { createBlogUploadUrl } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function RichTextEditor({ slug, initialHtml, onChange }: { slug: string; initialHtml: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: { attributes: { class: "prose-editor min-h-[360px] focus:outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  async function uploadImage(file: File) {
    if (!editor) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const res = await createBlogUploadUrl(slug || "post", "img", ext);
      if ("error" in res) return;
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage.from("blog-media").uploadToSignedUrl(res.path, res.token, file, { contentType: file.type });
      if (error) return;
      const { data } = supabase.storage.from("blog-media").getPublicUrl(res.path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } finally {
      setBusy(false);
    }
  }

  if (!editor) return null;
  const btn = "border border-[#343437] px-2.5 py-1.5 font-display text-[10px] uppercase tracking-[0.12em] text-[#F4EFE5] hover:border-[#D6B77A]";
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;</button>
        <button type="button" className={btn} onClick={() => { const url = prompt("링크 URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>Link</button>
        <button type="button" className={btn} disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? "업로드중…" : "이미지"}</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); }} />
      <div className="border border-[#343437] bg-[#111214] p-4 font-kr text-sm text-[#F4EFE5]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
