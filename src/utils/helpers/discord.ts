import { getSetting } from "@/server/settings";
import { type Embed, Webhook } from "@vermaysha/discord-webhook";

export const embedColors = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  purple: "#800080",
  cyan: "#00FFFF",
}
export const getOrderWebhook = async () => {
  const url = await getSetting<string>("discordWebhook");
  if (!url || !url.value) {
    return null;
  }
  return new Webhook(url.value);
}
export const sendOrderWebhook = async (embed: Embed, defaultFooter = true) => {
  const webhook = await getOrderWebhook();
  if (!webhook) {
    return;
  }
  if (defaultFooter) {   
    await webhook.addEmbed(embed.setFooter({
      text: "Powered by Arc"
    })).send();
  } else {
    await webhook.addEmbed(embed).send();
  }
}