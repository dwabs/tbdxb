import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { UsersFilterBar } from "@/components/users/users-filter-bar";
import { UsersPagination } from "@/components/users/users-pagination";
import { UsersTable } from "@/components/users/users-table";
import { createClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/lib/types";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users", {
    p_query: q || null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });

  if (error) console.error("admin_list_users:", error.message);

  const users = (data ?? []) as AdminUser[];

  // total_count only rides along on returned rows, so a page number past
  // the last real one gets zero rows back — no way to tell whether that's
  // "past the end" or a real empty search from this response alone.
  // Either way, page > 1 with nothing back means the number is stale (a
  // search narrowed the results, or rows were deleted) — clamp to page 1
  // instead of stranding the admin on a dead "No users found" with no
  // pagination control to get back.
  if (users.length === 0 && page > 1) {
    redirect(q ? `/users?q=${encodeURIComponent(q)}` : "/users");
  }

  const totalCount = users[0]?.total_count ?? 0;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      <UsersFilterBar />

      <Card>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>

      <UsersPagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} q={q} />
    </div>
  );
}
