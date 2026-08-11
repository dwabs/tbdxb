/**
 * Row shapes for the tables this app touches. Hand-written rather than
 * generated, same rationale as apps/vendor/lib/types.ts — a generated file
 * would drag in every table on the project.
 */

export type VendorStatus = "pending" | "approved" | "suspended";

export type Vendor = {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  bio: string | null;
  status: VendorStatus;
  commission_rate: number;
};

/** Badge styling per vendor lifecycle state. */
export const VENDOR_STATUS_META: Record<
  VendorStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-900" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-900" },
};

/** admin_list_admins()'s return shape — email comes from a live auth.users
 *  join, not a column on profile (see 0011's migration comment). */
export type AdminProfile = {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
};

export type VendorRole = "owner" | "staff";

/** vendor_list_team()'s return shape — same live auth.users join as
 *  AdminProfile, for the same reason (see 0020's migration comment). */
export type TeamMember = {
  user_id: string;
  full_name: string | null;
  email: string;
  role: VendorRole;
  created_at: string;
};
