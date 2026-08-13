/**
 * Row shapes for the tables this app touches. Hand-written rather than
 * generated, same rationale as apps/vendor/lib/types.ts — a generated file
 * would drag in every table on the project.
 */

export type VendorStatus = "pending" | "approved" | "suspended";

export type EventStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

/** Badge styling per lifecycle state — mirrors apps/vendor's STATUS_META
 *  labels, but translucent-on-dark rather than pale-on-light: this app is
 *  dark-only (app/layout.tsx forces the `dark` class), so the light-mode
 *  bg-{color}-100/text-{color}-900 pair vendor uses would render as a
 *  near-white chip instead of a muted dark-mode one. */
export const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: { label: "In review", className: "bg-amber-500/15 text-amber-400" },
  approved: { label: "Approved", className: "bg-sky-500/15 text-sky-400" },
  published: { label: "Live", className: "bg-emerald-500/15 text-emerald-400" },
  rejected: { label: "Changes needed", className: "bg-red-500/15 text-red-400" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

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
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-400" },
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-400" },
  suspended: { label: "Suspended", className: "bg-red-500/15 text-red-400" },
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

export type EventRow = {
  id: string;
  vendor_id: string;
  slug: string;
  status: EventStatus;
  title: string;
  venue: string;
  area: string;
  starts_at: string | null;
  ends_at: string | null;
  duration_label: string;
  group_size: string;
  tags: string[];
  view_count: number;
};

export type TicketType = {
  id: string;
  event_id: string;
  title: string;
  price_aed: number;
  discount_price_aed: number | null;
  quantity_total: number;
  quantity_sold: number;
  position: number;
};

export type BookingStatus = "confirmed" | "cancelled" | "completed";

/** Same shape as apps/vendor's Booking, plus vendor_id/vendor_name — this
 *  app's bookings span every vendor, so the vendor isn't always implicit. */
export type AdminBooking = {
  id: string;
  reference: string;
  event_id: string | null;
  event_title: string;
  event_slug: string;
  quantity: number;
  total_aed: number;
  event_date: string;
  status: BookingStatus;
  attendee_name: string;
  attendee_phone: string;
  checked_in_at: string | null;
  created_at: string;
  vendor_id: string | null;
  vendor_name: string | null;
};

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-500/15 text-emerald-400" },
  completed: { label: "Completed", className: "bg-sky-500/15 text-sky-400" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-400" },
};

/** admin_list_users()'s return shape (0024) — a page of every signed-up
 *  user, with a total_count column repeated on every row so the client can
 *  render pagination without a second round trip. */
export type AdminUser = {
  id: string;
  full_name: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
  vendor_names: string[];
  total_count: number;
};

/** admin_platform_stats()'s return shape (0023) — a single row of platform-
 *  wide totals for the dashboard. */
export type AdminPlatformStats = {
  vendors_pending: number;
  vendors_approved: number;
  vendors_suspended: number;
  events_draft: number;
  events_submitted: number;
  events_approved: number;
  events_published: number;
  events_rejected: number;
  events_archived: number;
  bookings_total: number;
  tickets_sold: number;
  views_total: number;
  gross_revenue_aed: number;
  commission_revenue_aed: number;
};
