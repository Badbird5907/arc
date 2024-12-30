import { env } from "@/env";
import rbac from "rbac-ts";

// WHEN MODIFYING, ADD TO 
export const rolesArr: [string, ...string[]] = ["user", "admin", "super_admin"];
export const roles = {
  user: {
    can: ["products:read"],
  },
  admin: {
    can: [
      "products:*",
      "settings:*",
      "servers:*",
      "orders:*",
      "coupons:*",
      "categories:*",
      "players:*",
    ],
    inherits: ["user"]
  },
  super_admin: {
    can: [
      "admin:*"
    ],
    inherits: ["admin"]
  }
}

export const RBAC = rbac({ enableLogger: typeof window === "undefined" && env.APP_ENV === "development" })(roles); // enable on server
