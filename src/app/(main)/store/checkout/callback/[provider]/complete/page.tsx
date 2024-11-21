"use client";
import AnimatedCheckMark from "@/components/animated-checkmark";
import { useCart } from "@/components/cart";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const Page = ({ params }: { params: { provider: string } }) => {
  const cart = useCart();
  useEffect(() => {
    cart.clear();
  }, []);
  useEffect(() => {
    void confetti({
      particleCount: 300,
      spread: 360,
      origin: {
        y: 0.5
      }
    });
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-y-hidden">
      <div className="container flex max-w-md flex-col items-center text-center">
        <AnimatedCheckMark className="text-green-500" />
        <h1 className="text-4xl font-bold">
          Success!
        </h1>
        <div className="flex flex-col gap-4 pt-4">
          <p className="text-lg text-muted-foreground">
            Your order has been successfully completed. You will receive your products in-game shortly.
          </p>
          <p className="text-muted-foreground/50 text-sm">
            This page does not serve as a valid receipt. Please check your email for your receipt.
          </p>
        </div>
        <Button asChild className="mt-8" size="lg">
          <Link href="/store">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Page;