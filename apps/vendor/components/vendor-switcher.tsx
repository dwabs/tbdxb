"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Only rendered when the signed-in user belongs to more than one vendor —
 *  team management (0020) is what first makes that a real case. Sets the
 *  active_vendor cookie directly and refreshes; layout.tsx re-reads it on
 *  every request, so no Server Action is needed for this. */
export function VendorSwitcher({
  vendors,
  activeVendorId,
}: {
  vendors: { id: string; name: string }[];
  activeVendorId: string;
}) {
  const router = useRouter();

  function onChange(id: string) {
    document.cookie = `active_vendor=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <Select value={activeVendorId} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 [&_svg]:text-white/60"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {vendors.map((vendor) => (
          <SelectItem key={vendor.id} value={vendor.id}>
            {vendor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
