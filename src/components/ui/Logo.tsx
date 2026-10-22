import Image from "next/image";
import { SITE_NAME } from "@/lib/site";

/** 站点 Logo：蚂蚁图标 + 站点名称 */
export default function Logo({ suffix = "" }: { suffix?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Image
        src="/brand/logo-ant.png"
        alt=""
        width={256}
        height={256}
        priority
        unoptimized
        className="h-8 w-auto shrink-0 sm:h-9"
      />
      <span className="truncate text-[14px] font-bold tracking-tight text-ink sm:text-[15px]">
        {SITE_NAME}
        {suffix}
      </span>
    </span>
  );
}
