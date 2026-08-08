"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_META, type EventStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: EventStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...(Object.keys(STATUS_META) as EventStatus[]).map((status) => ({
    value: status,
    label: STATUS_META[status].label,
  })),
];

const WHEN_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All dates" },
] as const;

export function EventsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "all";
  const when = params.get("when") ?? "upcoming";
  const hasFilters = q || status !== "all" || when !== "upcoming";

  function apply(next: Record<string, string>) {
    const merged = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all" || (key === "when" && value === "upcoming")) {
        merged.delete(key);
      } else {
        merged.set(key, value);
      }
    }
    startTransition(() => {
      const query = merged.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    apply({ q: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-48">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          key={q}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search events…"
          className="h-9 w-full rounded-md border border-input bg-transparent py-2 pr-3 pl-8 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </form>

      <Select value={status} onValueChange={(value) => apply({ status: value })}>
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={when} onValueChange={(value) => apply({ when: value })}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="When" />
        </SelectTrigger>
        <SelectContent>
          {WHEN_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname))}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
