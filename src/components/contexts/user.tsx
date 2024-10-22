"use client";
import { User } from "@/types";
import React, { createContext, useContext } from "react";

export const UserContext = createContext<{ user: User } | null>(null);

export const useUser = () => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return user.user;
}
export const UserProvider = ({ user, children }: { user: User; children: React.ReactNode }) => {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}