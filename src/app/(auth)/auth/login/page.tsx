import { LoginProviderButton } from "@/app/(auth)/auth/login/provider-btn";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Login with a provider:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex flex-col w-full gap-4">
            <LoginProviderButton provider="discord" providerName="Discord" icon={<FaDiscord />} />
            <LoginProviderButton provider="github" providerName="GitHub" icon={<FaGithub />} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}