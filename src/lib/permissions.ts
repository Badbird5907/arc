import { pgEnum } from "drizzle-orm/pg-core";
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
    ],
    inherits: ["user"]
  },
  super_admin: {
    can: [
      "products:*",
      "users:*",
      "admin:*"
    ],
    inherits: ["admin"]
  }
}

export const RBAC = rbac({ enableLogger: typeof window === "undefined" })(roles); // enable on server
