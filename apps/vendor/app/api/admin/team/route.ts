import { randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

type CreateVendorBody = {
  mode: "create_vendor";
  email: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
};

type AddMemberBody = {
  mode: "add_member";
  email: string;
  vendorId: string;
  role: "owner" | "staff";
};

/** No dictionary word list — this is relayed out-of-band by an admin, not
 *  memorized, so entropy matters more than typability. */
function generateTempPassword() {
  return randomBytes(12).toString("base64url");
}

/**
 * The only place in this app that touches the service-role client. It exists
 * because creating an `auth.users` row is a GoTrue admin-API call, not SQL —
 * a security-definer Postgres function can't do it. Every actual table write
 * still goes through an RPC on the normal, cookie-bound client below, so
 * `auth.uid()` inside those functions reflects the real caller and their own
 * authorization gate (is_admin / owner-of-this-vendor) still applies — this
 * route only adds the ability to resolve or create the target auth.users
 * row, not a way around those checks.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as CreateVendorBody | AddMemberBody;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  // The RPCs below re-check this too (they're the real gate on the table
  // writes), but checking here first avoids letting any signed-in account
  // trigger an admin.createUser() call — a real GoTrue side effect — only
  // to have the RPC reject the write a moment later.
  const { data: profile } = await supabase
    .from("profile")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  let authorized = profile?.is_admin ?? false;
  if (!authorized && body.mode === "add_member") {
    const { data: membership } = await supabase
      .from("vendor_member")
      .select("role")
      .eq("vendor_id", body.vendorId)
      .eq("user_id", user.id)
      .eq("role", "owner")
      .maybeSingle();
    authorized = Boolean(membership);
  }
  if (!authorized) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }

  const admin = createAdminClient();

  // Resolve or create the auth.users row. "already registered" is the
  // expected path for adding an existing person to a second vendor, not an
  // error — look them up instead of failing.
  let targetUserId: string | null = null;
  let tempPassword: string | null = null;

  const { data: existingId } = await supabase.rpc("find_user_by_email", {
    p_email: email,
  });

  if (existingId) {
    targetUserId = existingId as string;
  } else {
    tempPassword = generateTempPassword();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return Response.json(
        { error: createError?.message ?? "Couldn't create the account." },
        { status: 500 },
      );
    }
    targetUserId = created.user.id;
  }

  if (body.mode === "create_vendor") {
    const baseSlug = slugify(body.name) || "vendor";
    let vendorId: string | null = null;
    let lastError: string | null = null;

    for (const slug of [baseSlug, `${baseSlug}-${randomBytes(2).toString("hex")}`]) {
      const { data, error: rpcError } = await supabase.rpc("admin_create_vendor", {
        p_user_id: targetUserId,
        p_name: body.name,
        p_slug: slug,
        p_contact_email: body.contactEmail,
        p_contact_phone: body.contactPhone || null,
      });
      if (!rpcError && data) {
        vendorId = data as string;
        break;
      }
      lastError = rpcError?.message ?? "Unknown error";
      if (rpcError?.code !== "23505") break;
    }

    if (!vendorId) {
      return Response.json({ error: lastError ?? "Couldn't create the vendor." }, { status: 400 });
    }
    return Response.json({ vendorId, tempPassword });
  }

  // mode === "add_member"
  const { error: rpcError } = await supabase.rpc("add_vendor_member", {
    p_vendor_id: body.vendorId,
    p_user_id: targetUserId,
    p_role: body.role,
  });
  if (rpcError) {
    return Response.json({ error: rpcError.message }, { status: 400 });
  }
  return Response.json({ tempPassword });
}
