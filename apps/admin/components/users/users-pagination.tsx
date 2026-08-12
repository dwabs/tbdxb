import Link from "next/link";

export function UsersPagination({
  page,
  pageSize,
  totalCount,
  q,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  q: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const query = params.toString();
    return query ? `/users?${query}` : "/users";
  }

  return (
    <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
      <p>
        Page {page} of {totalPages} · {totalCount} user{totalCount === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="rounded-md border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">Previous</span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="rounded-md border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">Next</span>
        )}
      </div>
    </div>
  );
}
