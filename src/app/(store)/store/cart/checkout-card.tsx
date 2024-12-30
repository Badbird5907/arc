import { CaptchaDialog } from "@/app/(store)/store/cart/checkout-dialog"
import { type CartStore } from "@/components/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { env } from "@/env"
import { api } from "@/trpc/react"
import { type Product } from "@/types"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { infoSchema } from "@/types/checkout"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const defaultStep = env.TURNSTILE_SITE_KEY ? "captcha" : "checkout";
const messages = [
  "Preparing...",
  "Hang on...",
  "Still working...",
  "Almost there...",
  "Just a moment...",
  "Almost done!",
]
export const CheckoutCard = ({ cart, products, coupons }: {
  cart: CartStore,
  products: Product[],
  coupons: string[]
}) => {
  const [step, setStep] = useState<"checkout" | "captcha">(defaultStep);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Preparing...");

  const beginCheckout = api.checkout.checkout.useMutation();

  const form = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: ""
    }
  });

  useEffect(() => {
    if (!beginCheckout.isPending) return;
    
    const interval = setInterval(() => {
      setLoadingText((current) => {
        const currentIndex = messages.indexOf(current);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex]!;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [beginCheckout.isPending]);

  const captchaDone = (token: string) => {
    setStep("checkout");
    const values = form.getValues();
    void beginCheckout.mutateAsync({
      provider: "tebex",
      captcha: token,
      data: {
        username: cart.player!.name,
        info: values,
        cart: Object.entries(cart.items).map(([id, { quantity }]) => ({
          id,
          quantity
        })),
        coupons: coupons
      }
    }).then((resp) => {
      if (resp.link) {
        setCheckoutLink(resp.link);
      }
    }).catch((err) => {
      toast.error("An error occurred while beginning checkout!", {
        description: (err as { message?: string })?.message ?? "An unknown error occurred! Please try again later."
      });
      setCheckoutLink("error");
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              <div className="flex flex-row gap-4 w-full">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Dialog onOpenChange={(open) => {
            if (!open) {
              // reset
              setStep(defaultStep);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!products || products.length === 0 || !form.formState.isValid}>
                Checkout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
              </DialogHeader>
              {step === "captcha" && <CaptchaDialog done={captchaDone} />}
              {step === "checkout" && (
                <div className="flex flex-col gap-4">
                  <p>You will be redirected to our payment provider <span className="text-primary">Tebex</span> to complete your purchase.</p>
                  <p>You will have 1 hour to complete your purchase. If you do not complete your purchase within 1 hour, please return to this page and try again.</p>
                  <Button className="w-full" onClick={() => {
                    if (checkoutLink === "error") {
                      toast.error("Failed to begin checkout!", {
                        description: "Please try again later."
                      });
                    } else if (checkoutLink) {
                      window.location.href = checkoutLink;
                    }
                  }} loading={beginCheckout.isPending} loadingText={loadingText}>
                    Continue
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card >

  )
}
