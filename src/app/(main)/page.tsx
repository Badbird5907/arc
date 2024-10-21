import { appConfig, discord } from "@/app/app-config";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function MainStorePage() {
  return (
    <div className="w-full">
      <div className="w-full h-[40vh] bg-cover bg-center bg-no-repeat text-center" style={{ backgroundImage: 'url(/img/banner.png)' }}>
        <div className="h-full place-content-center gap-4 flex flex-col">
          <Image src="/img/logo.png" width={128} height={128} alt={appConfig.title} className="self-center" />
          <h1 className="text-6xl md:text-8xl font-bold">{appConfig.title}</h1>
          <h1 className="text-4xl md:text-6xl font-bold">{appConfig.shortDescription}</h1>
          <div className="flex flex-row gap-4 justify-center pt-4">
            <Link href="/store">
              <Button size={"xl"}>Support Me!</Button>
            </Link>
            <Link href={discord}>
              <Button size={"xl"}>
                <span className="flex flex-row gap-4 items-center">
                  <FaDiscord /> Discord
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}