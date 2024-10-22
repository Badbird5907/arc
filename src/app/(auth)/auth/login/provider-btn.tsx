"use client";
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client";
import { type Provider } from "@supabase/supabase-js";

export const LoginProviderButton = ({ provider, providerName, icon }: { provider: Provider, providerName: string, icon: React.ReactNode }) => {
  return (
    <Button onClick={async () => {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo
        }
      })
      if (error) {
        console.error(error)
        return
      }
      console.log(data)
    }}>
      <span className="flex flex-row gap-2">
        {icon} {providerName}
      </span>
    </Button>
  )
}