import { env } from "@/env";

export const verifyCaptcha = async (token: string, ip?: string) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const res = await fetch(url, {
    method: "POST",
    body: formData
  });
  const json = await res.json() as { success: boolean };
  return json.success;
}