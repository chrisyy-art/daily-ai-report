import Image from "next/image";
import { SITE_NAME } from "@/lib/site";

/** 站点 Logo：地球图标 + 站点名称 */
export default function Logo({ suffix = "" }: { suffix?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Image
        src="/brand/logo-globe.png"
        alt=""
        width={294}
        height={282}
        priority
        unoptimized
        className="h-9 w-auto shrink-0 sm:h-10"
      />
      <span className="truncate text-[15px] font-bold tracking-tight text-ink sm:text-[17px]">
        {SITE_NAME}
        {suffix}
      </span>
    </span>
  );
}
