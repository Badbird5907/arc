import { buildSkinRenderUrl, type RenderConfig } from "@badbird5907/mc-utils";
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
  srcOverride?: string;
}

export const PlayerSkinImage = ({ name, skinUrl, renderConfig, height = 128, width = 128, fill = false, className, srcOverride }: PlayerSkinImageType) => {
  const src = useMemo(() => buildSkinRenderUrl(name, renderConfig, skinUrl), [name, renderConfig, skinUrl]);

  const props = fill ? { fill: true } : { height, width };

  return (
    <Image
      src={srcOverride ?? src}
      alt={`${name}'s skin`}
      className={className}
      {...props}
    />
  )
}