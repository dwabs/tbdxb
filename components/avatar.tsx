import Image from "next/image";

import { cn } from "@/lib/utils";

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * A user's avatar image, or their initials on the brand fill when there is
 * none. Sizing is entirely up to the caller's className (e.g. "size-9" in
 * the header, "size-20" on the account page) — this only supplies the shape
 * and content.
 */
export function Avatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={128}
        height={128}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-semibold text-white",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
