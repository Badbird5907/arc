import { signInWithDiscord } from "@/app/(auth)/auth/actions";
import { Button } from "@/components/ui/button";


export default function LoginPage() {
  return (
    <Button onClick={signInWithDiscord}>Login</Button>
  )
}