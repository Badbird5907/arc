"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  asDiv?: boolean;
  element?: React.ElementType;
  loading?: boolean;
  disableLoadingText?: boolean;
  loadingText?: string;
  onClickLoading?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<unknown>;
  loadingStateChange?: (loading: boolean) => void;
  toggle?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  tooltip?: React.ReactNode;
}

const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant,
        size,
        asChild = false,
        asDiv = false,
        element,
        loadingText = "Loading...",
        disableLoadingText,
        loading,
        ...props
      },
      ref,
    ) => {
      const [loadingState, setLoading] = React.useState(false);
      React.useEffect(
        () => setLoading(loading ?? false),
        [loading],
      );
      React.useEffect(
        () => props.loadingStateChange?.(loadingState),
        [loadingState, props],
      );

      const Comp = (element ??
        (asChild ? Slot : asDiv ? "div" : "button")) as React.ElementType;
      const disabled = props.disabled ?? loadingState;
      const children = loadingState ? ( // TODO: fix the width changing
        <div className={"flex flex-row items-center gap-1"}>
          <Spinner /> {!disableLoadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        props.children
      );
      const onClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ) => {
        if (props.onClickLoading) {
          setLoading(true);
          const promise = props.onClickLoading(event);
          if (promise instanceof Promise) {
            // sanity check
            void promise.finally(() => setLoading(false));
          }
        } else if (props.onClick) {
          props.onClick(event);
        } else if (props.toggle) {
          props.toggle[1]((prev) => !prev);
        }
      };

      const actualComponent = (
        <Comp
          {...props}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Comp>
      );

      if (props.tooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{actualComponent}</TooltipTrigger>
              <TooltipContent>{props.tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return actualComponent;
    },
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };