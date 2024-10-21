"use server";

import { db } from "@/server/db";
import { createClient } from "@/utils/supabase/server";
import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";

export async function getSession() {
  unstable_noStore();
  const supabase = createClient();
  return supabase.auth.getUser();
}

export async function getUser() {
  const session = await getSession();
  if (!session.data.user) {
    return null;
  }
  return db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.data.user!.id),
  });
}

export async function login(email: string, password: string, next?: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return JSON.stringify(error);
  } else {
    return redirect(next ?? "/");
  }
}

export async function signup(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  return JSON.stringify({ data, error });
}

export async function logout() {
  const session = await getSession();
  if (!session.data.user) {
    return redirect("/");
  }
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/");
}