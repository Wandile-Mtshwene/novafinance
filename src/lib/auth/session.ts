import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getUserById } from "@/lib/db/queries/users";

export const getOrgSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const finUser = await getUserById(session.user.id);
  if (!finUser) throw new Error("User has no organization");

  return {
    userId: session.user.id,
    orgId: finUser.organization_id,
    role: finUser.role,
    user: session.user,
  };
});
