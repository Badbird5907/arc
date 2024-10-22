import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Lock, CreditCard, Server } from "lucide-react"
import Link from "next/link"

export type ErrorCode = "404" | "401" | "402" | "500";

export const ErrorPage = ({ code }: { code: ErrorCode }) => {
  const errorConfig: Record<ErrorCode, {
    title: string;
    message: string;
    icon: JSX.Element;
    action: {
      text: string;
      href: string;
      onClick?: () => void;
    };
  }> = {
    "404": {
      title: "Page Not Found",
      message: "Sorry, we couldn't find the page you're looking for.",
      icon: <AlertCircle className="h-24 w-24 text-muted-foreground" />,
      action: {
        text: "Go back home",
        href: "/",
      },
    },
    "401": {
      title: "Unauthorized",
      message: "You don't have permission to access this page.",
      icon: <Lock className="h-24 w-24 text-muted-foreground" />,
      action: {
        text: "Log in",
        href: "/auth/login",
      },
    },
    "402": {
      title: "Payment Required",
      message: "A payment is required to access this content.",
      icon: <CreditCard className="h-24 w-24 text-muted-foreground" />,
      action: {
        text: "Upgrade account",
        href: "/upgrade",
      },
    },
    "500": {
      title: "Server Error",
      message: "Oops! Something went wrong on our end.",
      icon: <Server className="h-24 w-24 text-muted-foreground" />,
      action: {
        text: "Try again",
        href: "#",
        onClick: () => window.location.reload(),
      },
    },
  }

  const defaultError = {
    title: `Error`,
    message: "An unexpected error occurred.",
    icon: <AlertCircle className="h-24 w-24 text-muted-foreground" />,
    action: {
      text: "Go back",
      href: "#",
      onClick: () => window.history.back(),
    },
  }

  const error = errorConfig[code] ?? defaultError

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-y-hidden">
      <div className="container flex max-w-md flex-col items-center text-center">
        {error.icon}
        <h1 className="mt-8 text-6xl font-bold">
          {code}
        </h1>
        <h1 className="text-4xl font-bold">
          {error.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-8" size="lg">
          <Link href={error.action.href} onClick={error.action.onClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {error.action.text}
          </Link>
        </Button>
      </div>
    </div>
  )
}