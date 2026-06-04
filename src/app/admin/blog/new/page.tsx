import { PostEditor } from "@/components/admin/post-editor";
import { createPost } from "@/app/admin/actions";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">새 글</h1>
      <PostEditor action={createPost} />
    </div>
  );
}
