"use client";

import Image from "next/image";
import { BRAND } from "@/lib/brand";

/** Banner only — branding is already in the image; no text/logo overlay. */
export function DashboardHero() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl shadow-md">
      <div className="relative aspect-[21/9] w-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px]">
        <Image
          src={BRAND.banner}
          alt={BRAND.name}
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>
    </section>
  );
}
