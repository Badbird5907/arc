import { appConfig } from "@/app/app-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GiPartyPopper } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";

import { FaMoneyBillWave, FaGift, FaBalanceScale, FaRedoAlt, FaHeart } from 'react-icons/fa';
import { HoverConfetti } from "@/components/ui/hover-confetti";
import React from "react";
import { ArrowRightIcon } from "lucide-react";

const questions = [
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras vitae justo et enim efficitur varius. Donec ornare leo ac orci sagittis euismod.",
    icon: FaMoneyBillWave
  },
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Class aptent taciti sociosqu ad litora",
    icon: FaGift
  },
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut malesuada rhoncus imperdiet. Nunc luctus enim vitae",
    icon: GiPartyPopper,
    confetti: true,
  },
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    icon: FaBalanceScale
  },
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse dignissim faucibus libero, ut blandit leo tempus porta.",
    icon: FaRedoAlt
  },
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc luctus enim vitae arcu ultricies dignissim. Nam eget hendrerit est, non tristique nisi.",
    icon: FaHeart
  }
]

export default function MainStorePage() {
  return (
    <div className="w-full">
      <div className="w-full h-[40vh] relative text-center">
        <div className="absolute inset-0">
          <Image 
            src="/img/banner.png"
            alt="Store banner"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative h-full place-content-center gap-2 flex flex-col">
          {appConfig.logo && (
            <Image src={appConfig.logo} width={128} height={128} alt={appConfig.title} className="place-self-center pb-2" />
          )}
          <h1 className="text-6xl md:text-8xl font-bold">{appConfig.title}</h1>
          <h1 className="text-4xl md:text-6xl font-bold">{appConfig.shortDescription}</h1>
          <div className="flex flex-row gap-4 justify-center pt-4">
            <Link href={"/store"} prefetch={false}>
              <Button size={"xl"} className="hover:scale-105 transition-all duration-500">
                <span className="flex flex-row gap-4 items-center">
                  <ArrowRightIcon /> Store
                </span>
              </Button>
            </Link>
            {/* <Link href={discord}>
              <Button size={"xl"} className="hover:scale-105 transition-all duration-500">
                <span className="flex flex-row gap-4 items-center">
                  <FaDiscord className="scale-150" /> Discord
                </span>
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row gap-4 p-12">
        {questions.map((question, index) => {
          const MaybeConfetti = question.confetti ? HoverConfetti : React.Fragment;
          return (
            <Card className="bg-zinc-900 hover:scale-105 transition-all" key={index}>
              <MaybeConfetti>
                <CardHeader>
                  <div className="flex flex-row gap-4">
                    <question.icon className="text-4xl" />
                    <span className="place-content-center">{question.title}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-gray-400">
                    {question.description}
                  </span>
                </CardContent>
              </MaybeConfetti>
            </Card>
          )
        })}
      </div>
    </div>
  )
}