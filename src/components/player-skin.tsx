import { buildSkinRenderUrl, RenderConfig } from "@badbird5907/mc-utils";
import { useMemo } from "react";
import Image from "next/image";

type PlayerSkinImageType = {
  name?: string;
  // uuid?: string;
  renderConfig: RenderConfig;
  skinUrl?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  className?: string;
}

export const PlayerSkinImage = ({ name, skinUrl, renderConfig, height = 128, width = 128, fill = false, className }: PlayerSkinImageType) => {
  const src = useMemo(() => buildSkinRenderUrl(name, renderConfig, skinUrl), [name, renderConfig, skinUrl]);

  const props = fill ? { fill: true } : { height, width };

  return (
    <Image
      src={src}
      alt={`${name}'s skin`}
      className={className}
      {...props}
    />
  )
}