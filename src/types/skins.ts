export type CropType = "full" | "bust" | "face" | "head" | "default" | "processed" | "barebones";

export type RenderConfigs = {
  default: { name: "default", availableCrops: ["full", "bust", "face"] },
  marching: { name: "marching", availableCrops: ["full", "bust", "face"] },
  walking: { name: "walking", availableCrops: ["full", "bust", "face"] },
  crouching: { name: "crouching", availableCrops: ["full", "bust", "face"] },
  crossed: { name: "crossed", availableCrops: ["full", "bust", "face"] },
  criss_cross: { name: "criss_cross", availableCrops: ["full", "bust", "face"] },
  ultimate: { name: "ultimate", availableCrops: ["full", "bust", "face"] },
  isometric: { name: "isometric", availableCrops: ["full", "bust", "face", "head"] },
  head: { name: "head", availableCrops: ["full"] },
  custom: { name: "custom", availableCrops: ["full", "bust", "face"] },
  cheering: { name: "cheering", availableCrops: ["full", "bust", "face"] },
  relaxing: { name: "relaxing", availableCrops: ["full", "bust", "face"] },
  trudging: { name: "trudging", availableCrops: ["full", "bust", "face"] },
  cowering: { name: "cowering", availableCrops: ["full", "bust", "face"] },
  pointing: { name: "pointing", availableCrops: ["full", "bust", "face"] },
  lunging: { name: "lunging", availableCrops: ["full", "bust", "face"] },
  dungeons: { name: "dungeons", availableCrops: ["full", "bust", "face"] },
  facepalm: { name: "facepalm", availableCrops: ["full", "bust", "face"] },
  sleeping: { name: "sleeping", availableCrops: ["full", "bust"] },
  dead: { name: "dead", availableCrops: ["full", "bust", "face"] },
  archer: { name: "archer", availableCrops: ["full", "bust", "face"] },
  kicking: { name: "kicking", availableCrops: ["full", "bust", "face"] },
  mojavatar: { name: "mojavatar", availableCrops: ["full", "bust"] },
  reading: { name: "reading", availableCrops: ["full", "bust", "face"] },
  high_ground: { name: "high_ground", availableCrops: ["full", "bust", "face"] },
  bitzel: { name: "bitzel", availableCrops: ["full", "bust", "face"] },
  pixel: { name: "pixel", availableCrops: ["full", "bust", "face"] },
  ornament: { name: "ornament", availableCrops: ["full"] },
  skin: { name: "skin", availableCrops: ["default", "processed", "barebones"] },
  profile: { name: "profile", availableCrops: ["full", "bust", "face"] }
}
export type RenderConfig = {
  [K in keyof RenderConfigs]: {
    name: RenderConfigs[K]["name"];
    crop: RenderConfigs[K]["availableCrops"][number];
  }
}[keyof RenderConfigs];
