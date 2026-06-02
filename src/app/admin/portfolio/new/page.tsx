import { CaseEditor } from "@/components/admin/case-editor";
import { createCase } from "@/app/admin/actions";

export default function NewCasePage() {
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">새 케이스</h1>
      <CaseEditor action={createCase} />
    </div>
  );
}
