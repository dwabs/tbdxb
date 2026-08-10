import { RemoveTeamMemberButton } from "@/components/team/remove-team-member-button";
import { createClient } from "@/lib/supabase/server";
import type { TeamMember } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Self-fetching so both the admin vendor-detail page and a vendor owner's
 *  own Settings page can render it without duplicating the RPC call —
 *  vendor_list_team() itself decides whether the caller is allowed to see
 *  this vendor's team (member of it, or admin). */
export async function TeamList({
  vendorId,
  canManage,
}: {
  vendorId: string;
  canManage: boolean;
}) {
  const supabase = await createClient();
  const [{ data }, { data: { user } }] = await Promise.all([
    supabase.rpc("vendor_list_team", { p_vendor_id: vendorId }),
    supabase.auth.getUser(),
  ]);

  const members = (data ?? []) as TeamMember[];

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No team members yet.</p>;
  }

  return (
    <ul className="divide-y">
      {members.map((member) => (
        <li key={member.user_id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {member.full_name || member.email}
                <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
                  {member.role}
                </span>
                {member.user_id === user?.id ? (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                ) : null}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {member.email} · joined {DATE.format(new Date(member.created_at))}
              </p>
            </div>
            {canManage ? (
              <RemoveTeamMemberButton vendorId={vendorId} userId={member.user_id} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
