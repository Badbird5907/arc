import { type PlayerInfo } from "@/components/cart";
import { type RenderConfig } from "@/types/skins";
import Image from "next/image";

const endpoint = "https://starlightskins.lunareclipse.studio/render";

type PlayerSkinImageType = {
  player: PlayerInfo;
  renderConfig: RenderConfig;
}
export const PlayerSkinImage = ({ player, renderConfig }: PlayerSkinImageType) => {
  return (
    <Image
      src={`${endpoint}/${renderConfig.name}/${player.uuid}/${renderConfig.crop}`}
      alt={`${player.name}'s skin`}
      width={128}
      height={128}
    />
  )
}