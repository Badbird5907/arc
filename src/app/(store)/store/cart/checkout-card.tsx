import { CaptchaDialog } from "@/app/(store)/store/cart/checkout-dialog"
import { type CartStore } from "@/components/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { env } from "@/env"
import { api } from "@/trpc/react"
import { type Product } from "@/types"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { infoSchema } from "@/types/checkout"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const defaultStep = env.TURNSTILE_SITE_KEY ? "captcha" : "checkout";
export const CheckoutCard = ({ cart, products }: {
  cart: CartStore,
  products: Product[]
}) => {
  const [captchaKey, setCaptchaKey] = useState<string | null>(null);
  const [step, setStep] = useState<"checkout" | "captcha">(defaultStep);
  const beginCheckout = api.checkout.checkout.useMutation();

  const form = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: ""
    }
  });

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
              setCaptchaKey(null);
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
              {step === "captcha" && <CaptchaDialog keyState={[captchaKey, setCaptchaKey]} done={() => setStep("checkout")} />}
              {step === "checkout" && (
                <div className="flex flex-col gap-4">
                  <p>You will be redirected to our payment provider <span className="text-primary">Tebex</span> to complete your purchase.</p>
                  <Button className="w-full" onClick={() => {
                    const values = form.getValues();
                    void beginCheckout.mutateAsync({
                      provider: "tebex",
                      data: {
                        username: cart.player!.name,
                        info: values,
                        cart: Object.entries(cart.items).map(([id, quantity]) => ({
                          id,
                          quantity
                        }))
                      }
                    }).then((resp) => {
                      if (resp.link) {
                        window.location.href = resp.link;
                      }
                    })
                  }} loading={beginCheckout.isPending}>
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
