"use client";

import confetti from "canvas-confetti";

import { useRef, RefObject } from "react";

export const useConfetti = (): { fire: (anchor: RefObject<HTMLElement>) => void } => {
  return {
    fire: (anchor: RefObject<HTMLElement>) => {
      let origin: undefined | { x: number; y: number } = undefined;
      if (anchor.current) {
        const rect = anchor.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        origin = {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        }
      }
      confetti({
        origin: {
          x: origin?.x ?? 0.5,
          y: origin?.y ?? 0.5,
        }
      })
    }
  }
}

export const HoverConfetti = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
  const { fire } = useConfetti();
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      onMouseEnter={() => {
        fire(ref);
      }}
      ref={ref}
    >
      {children}
    </div>
  )
}