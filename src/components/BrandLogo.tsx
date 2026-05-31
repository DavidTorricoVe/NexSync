import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  light?: boolean;
  link?: boolean;
  className?: string;
};

const iconSizes = {
  sm: { box: 32, className: "h-8 w-8" },
  md: { box: 40, className: "h-10 w-10" },
  lg: { box: 56, className: "h-14 w-14" },
};

const textSizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

export default function BrandLogo({
  size = "md",
  showTagline = false,
  light = false,
  link = true,
  className = "",
}: BrandLogoProps) {
  const icon = iconSizes[size];
  const wordmark = (
    <span
      className={`font-brand ${textSizes[size]} font-extrabold leading-none tracking-tight`}
      aria-hidden
    >
      <span
        className={
          light
            ? "text-emerald-400 drop-shadow-sm"
            : "bg-gradient-to-br from-emerald-500 to-brand-secondary bg-clip-text text-transparent"
        }
      >
        Nex
      </span>
      <span className={light ? "text-white drop-shadow-sm" : "text-brand-primary"}>
        Sync
      </span>
    </span>
  );

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/nexsync-logo.png"
        alt=""
        width={icon.box}
        height={icon.box}
        className={`${icon.className} shrink-0 object-contain`}
        priority={size !== "sm"}
      />
      <div className="min-w-0">
        {wordmark}
        {showTagline && (
          <p
            className={`mt-0.5 hidden sm:block text-[10px] font-medium leading-tight ${
              light ? "text-white/70" : "text-brand-muted"
            } max-w-[160px]`}
          >
            {BRAND_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href="/" className="group inline-flex" aria-label={BRAND_NAME}>
        {content}
      </Link>
    );
  }

  return content;
}
