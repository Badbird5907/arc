import { RBAC } from "@/lib/permissions";
import { getSession } from "@/server/actions/auth";
import type { User } from "@/types"
import { getUser } from "@/utils/server/helpers";
import { redirect } from "next/navigation";
export const adminWrapper = <T>(
  func: (data: {
    user: User
  } & T) => unknown, // allow any return type (Promise)
  rbac: string = "admin:view"
) => {
  return async (params: T) => {
    const session = await getSession();
    if (!session.data.user) {
      return redirect("/auth/login");
    }
    const user = await getUser(session.data.user.id);
    if (!user) {
      return redirect("/auth/login");
    }
    if (!await (RBAC.can(user.role, rbac))) {
      return redirect("/error?code=401")
    }
    return await func({ user, ...params });
  }
};