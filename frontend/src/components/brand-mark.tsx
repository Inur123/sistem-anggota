import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center rounded-xl border border-primary/10 bg-white p-1 shadow-sm", className)} aria-label="IPNU dan IPPNU">
      <span className="grid size-7 place-items-center">
        <Image src="/images/ipnu.png" alt="" width={24} height={24} className="size-6 object-contain" />
      </span>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <span className="grid size-7 place-items-center">
        <Image src="/images/ppnu.png" alt="" width={24} height={24} className="size-6 object-contain" />
      </span>
    </span>
  );
}
