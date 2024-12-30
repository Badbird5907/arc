import { Delivery, Order, Product } from "@/types";
import { getPlayerFromUuid } from "@/utils/server/helpers";
import { expiryPeriodToDays } from "@badbird5907/mc-utils";

type Variable = {
  name: string;
  description: string;

  replace: (data: { value: string, order: Order, product: Product, delivery: Delivery }) => Promise<string | number>;
}
export const variables: Variable[] = [
  { name: "uuid", description: "The UUID of the player", replace: async ({ order }) => order.playerUuid },
  { name: "username", description: "The username of the player", replace: async ({ order }) => {
    const player = await getPlayerFromUuid(order.playerUuid);
    if (player.notFound) {
      return order.playerUuid;
    }
    return player.data?.name ?? order.playerUuid;
  } },
  { name: "ip", description: "The IP address of the customer", replace: async ({ order }) => order.ipAddress },
  { name: "email", description: "The email address of the customer", replace: async ({ order }) => order.email },
  { name: "server", description: "The server scope of the delivery", replace: async ({ delivery }) => {
    return delivery ? delivery.scope : "";
  } },
  { name: "order_id", description: "The ID of the order", replace: async ({ order }) => order.id },
  { name: "product_id", description: "The ID of the product", replace: async ({ product }) => product.id },
  { name: "product_name", description: "The name of the product", replace: async ({ product }) => product.name },
  { name: "product_price", description: "The price of the product", replace: async ({ product }) => product.price },
  { name: "product_expiry", description: "The expiry length of the product", replace: async ({ product }) => product.expiryLength },
  { name: "product_expiry_period", description: "The expiry period of the product", replace: async ({ product }) => product.expiryPeriod },
  { name: "product_expiry_fmt", description: "The expiry length of the product formatted in days (ie. 30d)", replace: async ({ product }) => `${expiryPeriodToDays(product.expiryPeriod, product.expiryLength)}d` },
]
export const getVariableList = () => variables.map((v) => ({ name: v.name, description: v.description }));