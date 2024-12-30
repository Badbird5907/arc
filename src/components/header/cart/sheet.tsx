import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMemo, type ReactNode } from "react"
import { useCart } from "@/components/cart"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/trpc/react"
import { type Product } from "@/types"
import { calculateTotal } from "@/lib/utils/cart"
import { Spinner } from "@/components/ui/spinner"
import { MinusCircle, PlusCircle, ShoppingCart, X } from "lucide-react"
import { CouponsCard } from "@/app/(store)/store/cart/coupons-card"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckoutForm } from "@/app/(store)/store/cart/checkout-card"
import { Badge } from "@/components/ui/badge"
import { formatExpiryPeriodShort } from "@badbird5907/mc-utils"
import { PlayerSkinImage } from "@/components/player-skin"

export const CartSheet = ({ trigger }: { trigger: ReactNode }) => {
  const cart = useCart();
  const items = useMemo(() => Object.entries(cart.items).map(([id, { quantity }]) => ({
    id,
    quantity
  })), [cart.items]);
  const itemsKeys = useMemo(() => items.map(({ id }) => id), [items]);
  const products = api.products.getProductsByIds.useQuery({
    ids: itemsKeys,
  });
  const productsRecord = useMemo(() => {
    const record: Record<string, Product> = {};
    products.data?.forEach(product => {
      record[product.id] = product;
    });
    return record;
  }, [products.data]);
  const hasUuid = !!cart.player && "uuid" in cart.player;
  const couponCheckEnabled = Object.keys(cart.coupons).length > 0 && hasUuid;
  const couponCheck = api.coupons.checkCoupons.useQuery({
    cart: Object.entries(cart.items).map(([id, { quantity }]) => ({
      id,
      quantity
    })),
    coupons: [...Object.keys(cart.coupons)],
    playerUuid: hasUuid ? cart.player!.uuid : "",
  }, {
    enabled: couponCheckEnabled
  })

  const total = useMemo(() => {
    if (!cart.items) return {
      total: 0,
      discountAmount: 0,
      subtotal: 0
    };
    const total = Object.keys(cart.items).reduce((acc, cur) => acc + (cart.items[cur]?.quantity ?? 0) * (products.data?.find(p => p.id === cur)?.price ?? 0), 0);
    if (couponCheckEnabled && !!couponCheck.data && "discountAmount" in couponCheck.data) {
      const removeCoupons = couponCheck.data.status.filter(c => !c.success).map(c => c.code);
      if (removeCoupons.length > 0) {
        removeCoupons.forEach(code => {
          cart.removeCoupon(code);
        });
        toast.error(`Removed ${removeCoupons.length} invalid coupon(s)!`, {
          description: removeCoupons.join(", ")
        })
      }
      return {
        total: total - couponCheck.data.discountAmount,
        discountAmount: couponCheck.data.discountAmount,
        subtotal: total
      };
    }
    return {
      total,
      discountAmount: 0,
      subtotal: total
    };
  }, [cart, couponCheckEnabled, couponCheck.data, products.data]);
  if (!cart.player) return null;
  if (!cart._hasHydrated) return <Spinner />;
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="space-y-4 pb-4">
          <SheetTitle className="flex items-center space-x-2 sr-only">
            <ShoppingCart className="h-5 w-5" />
            <span>Your Cart</span>
          </SheetTitle>
          <div className="flex justify-between items-start">
            <div className="flex flex-row items-center gap-2">
              <div className="w-16 flex items-start justify-center overflow-hidden place-self-center bg-accent/80 rounded-lg pt-1">
                <PlayerSkinImage
                  name={cart.player.name}
                  width={48}
                  height={48}
                  renderConfig={{
                    name: "ultimate",
                    crop: "bust"
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{cart.player.name}</h1>
                <Button
                  onClick={() => cart.setPlayer(null)}
                  variant="destructive"
                  size="sm"
                  className="mt-1"
                >
                  Log Out
                </Button>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cart.clear()}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = productsRecord[item.id];
                if (!product) return null;
                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between space-x-4 py-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium leading-none">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${product.price.toFixed(2)} {product.type === "single" ? `× ${item.quantity}` : `/${formatExpiryPeriodShort(product.expiryPeriod, product.expiryLength)}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {product.type === "single" ? (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={item.quantity <= product.minQuantity}
                              onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={product.maxQuantity > 0 && item.quantity >= product.maxQuantity}
                              onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge>
                            Subscription
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => cart.removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        {items.length > 0 && (
          <div className="space-y-4 pt-6">
            <CouponsCard coupons={cart.coupons} cart={cart.items} player={cart.player} addCoupon={cart.addCoupon} removeCoupon={cart.removeCoupon} />
            <div className="space-y-1.5">
              {/* <div className="flex items-center justify-between text-base">
                <span className="font-medium">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tax</span>
                <span>TBD (at checkout)</span>
              </div> */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${total.subtotal.toFixed(2)}</span>
              </div>
              {total.discountAmount > 0 && (
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Discount</span>
                  <span>-${total.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.total.toFixed(2)}</span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Checkout
                  </DialogTitle>
                </DialogHeader>
                <CheckoutForm cart={cart} products={products.data ?? []} coupons={Object.keys(cart.coupons)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}