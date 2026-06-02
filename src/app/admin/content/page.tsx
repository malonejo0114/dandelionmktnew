import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { getSiteContent } from "@/lib/site-content";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">사이트 콘텐츠</h1>
      <SiteContentEditor initial={content} />
    </div>
  );
}
