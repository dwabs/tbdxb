import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function UsersTable({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No users found.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {users.map((user) => (
        <li key={user.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {user.full_name || "—"}
                {user.is_admin ? (
                  <Badge variant="secondary" className="ml-2 align-middle">
                    Admin
                  </Badge>
                ) : null}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {user.email} · joined {DATE.format(new Date(user.created_at))}
              </p>
              {user.vendor_names.length > 0 ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {user.vendor_names.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
