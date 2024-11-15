import { cn } from "@/lib/utils";
import React from "react";

const strokeWidth = 4;
export const Spinner = ({ className, size = 40 }: { className?: string; size?: number }) => {
  return (
    <div className={cn("relative text-primary", className)} style={{ width: size, height: size }}>
      <svg
        className="animate-spin"
        viewBox="0 0 50 50"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke={"currentColor"}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="opacity-75"
          cx="25"
          cy="25"
          r="20"
          stroke={"currentColor"}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={125.6}
          strokeDashoffset={125.6}
          style={{
            animation: 'spinner-dash 1.5s ease-in-out infinite',
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes spinner-dash {
          0% {
            stroke-dashoffset: 125.6;
          }
          50% {
            stroke-dashoffset: 31.4;
          }
          100% {
            stroke-dashoffset: 125.6;
          }
        }
      `}</style>
    </div>
  )
};
