import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Image from "next/image";



const editions = [
  {
    name: "Java Edition",
    image: "/img/grass_block.webp",
  },
  {
    name: "Bedrock Edition",
    image: "/img/bedrock_block.webp",
    hover: "(Bugrock Edition)"
  }
]
export const EditionSelect = () => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {editions.map((edition) => {
        const comp = (
          <Card className="w-full" key={edition.name} onClick={() => {
            console.log(edition);
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
        if (edition.hover) {
          return (
            <HoverCard key={edition.name}>
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