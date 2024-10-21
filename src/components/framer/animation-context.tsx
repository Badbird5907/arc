"use client";

import SlideDown from "@/components/framer/slide-down";
import { createContext, useContext } from "react";

export const DelayContext = createContext<{
  delay: number;
  animType: React.ElementType;
}>({ delay: 0.2, animType: SlideDown });

export const AnimationSection = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  animType?: React.ElementType;
}) => {
  const parent = useContext(DelayContext);
  const AnimComponent = props.animType ?? parent.animType;
  return (
    <DelayContext.Provider value={{ delay: parent.delay + (props.delay ?? 0.2), animType: AnimComponent }}>
      <AnimComponent>{children}</AnimComponent>
    </DelayContext.Provider>
  );
};