import { appConfig, discord } from "@/app/app-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GiPartyPopper } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

import { FaMoneyBillWave, FaGift, FaBalanceScale, FaRedoAlt, FaHeart } from 'react-icons/fa';
import { HoverConfetti } from "@/components/ui/hover-confetti";
import React from "react";
import { PlayerSkinImage } from "@/components/player-skin";

const questions = [
  {
    title: "Where does the money go?",
    description: "Your purchase not only enhances your experience but also helps keep the server running smoothly. A portion goes to friends and family who supported me in building this community, ensuring everything stays top-notch.",
    icon: FaMoneyBillWave
  },
  {
    title: "Awesome Perks for Donors!",
    description: "Unlock exclusive perks like custom gear, priority access when the server is full, and rare items. These perks make the game more enjoyable without giving anyone an unfair advantage.",
    icon: FaGift
  },
  {
    title: "Fun Events and Giveaways!",
    description: "Your support fuels exciting events and fun giveaways where everyone can compete for cool rewards like rare items and special ranks. Join in for creative challenges and teamwork-based events!",
    icon: GiPartyPopper,
    confetti: true,
  },
  {
    title: "Fair Play, Always!",
    description: "Even with donor perks, the game stays fair. No game-breaking advantages here—everything is balanced, focusing on skill, strategy, and fun for everyone.",
    icon: FaBalanceScale
  },
  {
    title: "Monthly Updates and New Features!",
    description: "We're always adding new content like quests, secret areas, and game modes to keep the experience fresh. Your support helps us bring exciting updates and features every month.",
    icon: FaRedoAlt
  },
  {
    title: "Supporting those who help build the server",
    description: "When you buy from the shop, you're not just getting perks—you’re also supporting the amazing people who helped make this community what it is. Together, we keep the server thriving.",
    icon: FaHeart
  }
]

export default function MainStorePage() {
  return (
    <div className="w-full">
      <div className="w-full py-8 bg-cover bg-center bg-no-repeat text-center" style={{ backgroundImage: 'url(/img/banner.png)' }}>
        <div className="h-full place-content-center gap-4 flex flex-col">
          <Image src="/img/logo.png" width={128} height={128} alt={appConfig.title} className="place-self-center pb-2" />
          <h1 className="text-6xl md:text-8xl font-bold">{appConfig.title}</h1>
          <h1 className="text-4xl md:text-6xl font-bold">{appConfig.shortDescription}</h1>
          <div className="flex flex-row gap-4 justify-center pt-4">
            <Link href="/store">
              <Button size={"xl"} className="hover:scale-105 transition-all duration-500">Support Me!</Button>
            </Link>
            <Link href={discord}>
              <Button size={"xl"} className="hover:scale-105 transition-all duration-500">
                <span className="flex flex-row gap-4 items-center">
                  <FaDiscord className="scale-150" /> Discord
                </span>
              </Button>
            </Link>
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