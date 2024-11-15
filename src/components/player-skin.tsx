import { type RenderConfig } from "@/types/skins";
import Image from "next/image";
import { useMemo } from "react";

const endpoint = "https://starlightskins.lunareclipse.studio/render";

type PlayerSkinImageType = {
  name?: string;
  // uuid?: string;
  renderConfig: RenderConfig;
  skinUrl?: string;
  height?: number;
  width?: number;
  className?: string;
}
export const PlayerSkinImage = ({ name, skinUrl, renderConfig, height = 128, width = 128, className }: PlayerSkinImageType) => {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (skinUrl)
      params.append("skinUrl", skinUrl);
    return params;
  }, [skinUrl]);
  const src = useMemo(() => {
    const url = new URL(`${endpoint}/${renderConfig.name}/${name}/${renderConfig.crop}`);
    if (queryParams)
      url.search = queryParams.toString();
    return url.toString();
  }, [name, queryParams, renderConfig.crop, renderConfig.name]);
  return (
    <Image
      src={src}
      alt={`${name}'s skin`}
      height={height}
      width={width}
      className={className}
    />
  )
}