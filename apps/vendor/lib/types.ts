/**
 * Row shapes for the tables this app touches. Hand-written rather than
 * generated: the vendor app reads a deliberate subset of the schema, and a
 * generated file would drag in every table on the project including the
 * public site's.
 */

export type EventStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

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

export type EventRow = {
  id: string;
  vendor_id: string;
  slug: string;
  status: EventStatus;
  title: string;
  short_title: string;
  summary: string;
  body: string;
  category: string;
  venue: string;
  area: string;
  starts_at: string | null;
  ends_at: string | null;
  duration_label: string;
  group_size: string;
  tags: string[];
  age_min: number | null;
  view_count: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketType = {
  id: string;
  event_id: string;
  title: string;
  description: string;
  price_aed: number;
  discount_price_aed: number | null;
  quantity_total: number;
  quantity_sold: number;
  position: number;
};

export type EventImage = {
  id: string;
  event_id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  position: number;
};

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export type Booking = {
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
};

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-900" },
  completed: { label: "Completed", className: "bg-sky-100 text-sky-900" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-900" },
};

/** Badge styling per vendor lifecycle state, same shape as STATUS_META. */
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

export type VendorSummaryStats = {
  vendor_id: string;
  tickets_sold: number;
  net_aed: number;
  upcoming_events: number;
};

export type VendorEventStats = {
  event_id: string;
  vendor_id: string;
  title: string;
  view_count: number;
  tickets_sold: number;
  gross_aed: number;
  net_aed: number;
};

/** Badge styling per lifecycle state, kept in one place so the list and the
 *  detail header can't drift apart. */
export const STATUS_META: Record<
  EventStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: { label: "In review", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Approved", className: "bg-sky-100 text-sky-900" },
  published: { label: "Live", className: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Changes needed", className: "bg-red-100 text-red-900" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};
