import AnimatedCancelMark from "@/components/animated-cancel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-y-hidden">
      <div className="container flex max-w-md flex-col items-center text-center">
        <AnimatedCancelMark className="text-red-500" />
        <h1 className="text-4xl font-bold">
          Canceled
        </h1>
        <div className="flex flex-col gap-4 pt-4">
          <p className="text-lg text-muted-foreground">
            Your order has been canceled.
          </p>
        </div>
        <Button asChild className="mt-8" size="lg">
          <Link href="/store/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to cart
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Page;