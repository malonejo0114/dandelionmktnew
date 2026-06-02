import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * 브랜드 마크(씰). public/logo-mark.png(투명 골드 링)를 박스에 맞춰 렌더한다.
 * 크기는 className의 size-* 로 제어한다. (예: <DandelionMark className="size-8" />)
 * 로고 교체 시 public/logo-mark.png 만 바꾸면 전체에 반영된다.
 */
export function DandelionMark({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("relative block size-12", className)} aria-hidden="true" {...props}>
      <Image src="/logo-mark.png" alt="" fill sizes="64px" className="object-contain" />
    </span>
  );
}
