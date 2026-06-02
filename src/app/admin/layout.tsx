import Link from "next/link";
import { getAdminEmail } from "@/lib/admin-auth";
import { signOut } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await getAdminEmail();
  return (
    <div className="min-h-screen bg-[#18191B] text-[#F4EFE5]">
      <header className="flex items-center justify-between border-b border-[#343437] px-6 py-4">
        <Link href="/admin" className="font-display text-sm uppercase tracking-[0.28em] text-[#D6B77A]">
          Dandelion Admin
        </Link>
        <nav className="flex items-center gap-6 font-display text-xs uppercase tracking-[0.18em]">
          <Link href="/admin/portfolio" className="hover:text-[#D6B77A]">Portfolio</Link>
          <Link href="/admin/content" className="hover:text-[#D6B77A]">콘텐츠</Link>
          <Link href="/" className="text-[#8B8B86] hover:text-[#D6B77A]">사이트 보기</Link>
          {email ? (
            <form action={signOut}>
              <button type="submit" className="text-[#8B8B86] hover:text-[#D96C63]">로그아웃</button>
            </form>
          ) : null}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
