import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Image from "next/image";



const editions = {
  java: {
    name: "Java Edition",
    image: "/img/grass_block.webp",
  },
  bedrock: {
    name: "Bedrock Edition",
    image: "/img/bedrock_block.webp",
    hover: "(Bugrock Edition)"
  }
} as const;
export const EditionSelect = ({ onSelect }: { onSelect: (edition: keyof typeof editions) => void }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {Object.entries(editions).map(([key, edition]) => {
        const comp = (
          <Card className="w-full h-full" key={key} onClick={() => {
            console.log(edition);
            onSelect(key as "java" | "bedrock");
          }}>
            <CardHeader className="hidden">
              <CardTitle className="hidden">{edition.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 group grayscale hover:grayscale-0 hover:scale-105 cursor-pointer transition-all duration-500 text-center space-y-4">
              <Image src={edition.image} width={64} height={64} alt={edition.name} className="justify-self-center" />
              <h1 className="text-xl font-bold">{edition.name}</h1>
            </CardContent>
          </Card>
        );
        if ("hover" in edition && edition.hover) {
          return (
            <HoverCard key={key}>
              <HoverCardTrigger className="w-full">
                {comp}
              </HoverCardTrigger>
              <HoverCardContent>
                {edition.hover}
              </HoverCardContent>
            </HoverCard>
          )
        }
        return comp;
      })}
    </div>
  )
}