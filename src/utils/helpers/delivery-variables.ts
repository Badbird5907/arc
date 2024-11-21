import { Order, Product } from "@/types";
import { expiryPeriodToDays } from "@/utils";
import { getPlayerFromUuid } from "@/utils/server/helpers";

type Variable = {
  name: string;
  description: string;

  replace: (value: string, order: Order, product: Product) => Promise<string | number>;
}
export const variables: Variable[] = [
  { name: "uuid", description: "The UUID of the player", replace: async (value, order, product) => order.playerUuid },
  { name: "username", description: "The username of the player", replace: async (value, order, product) => {
    const player = await getPlayerFromUuid(order.playerUuid);
    if ("notFound" in player) {
      return order.playerUuid;
    }
    return player.data.name;
  } },
  { name: "ip", description: "The IP address of the customer", replace: async (value, order, product) => order.ipAddress },
  { name: "email", description: "The email address of the customer", replace: async (value, order, product) => order.email },
  { name: "server", description: "The server scope of the delivery", replace: async (value, order, product) => {
    const delivery = product.delivery?.find((d) => d.scope === value);
    return delivery ? delivery.scope : "";
  } },
  { name: "order_id", description: "The ID of the order", replace: async (value, order, product) => order.id },
  { name: "product_id", description: "The ID of the product", replace: async (value, order, product) => product.id },
  { name: "product_name", description: "The name of the product", replace: async (value, order, product) => product.name },
  { name: "product_price", description: "The price of the product", replace: async (value, order, product) => product.price },
  { name: "product_expiry", description: "The expiry length of the product", replace: async (value, order, product) => product.expiryLength },
  { name: "product_expiry_period", description: "The expiry period of the product", replace: async (value, order, product) => product.expiryPeriod },
  { name: "product_expiry_fmt", description: "The expiry length of the product formatted in days (ie. 30d)", replace: async (value, order, product) => `${expiryPeriodToDays(product.expiryPeriod, product.expiryLength)}d` },
]
export const getVariableList = () => variables.map((v) => ({ name: v.name, description: v.description }));