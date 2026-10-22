import Image from "next/image";
import { BRAND_TEXT } from "@/lib/site";

/** 品牌 Logo：「蚂蚁集团 | 数字科技」图片 + 栏目名称 */
export default function Logo({ suffix = "" }: { suffix?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Image
        src="/brand/antgroup-digital-tech.png"
        alt="蚂蚁集团 数字科技"
        width={276}
        height={86}
        priority
        unoptimized
        className="h-7 w-auto shrink-0 sm:h-10"
      />
      <span className="truncate text-[13px] font-semibold tracking-tight text-ink sm:text-[15px]">
        {BRAND_TEXT}
        {suffix}
      </span>
    </span>
  );
}
