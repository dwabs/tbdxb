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
