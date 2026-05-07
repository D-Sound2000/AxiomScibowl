"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90",
        cool: "bg-linear-to-t border border-b-2 border-zinc-950/40 from-white to-white/85 shadow-md shadow-white/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 text-black",
        outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        ghost: "text-white hover:bg-white/10",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
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
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-white/40 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent text-white hover:scale-[1.03] duration-300",
        outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        ghost: "text-white hover:bg-white/10",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-11 px-7",
        xl: "h-12 px-8",
        xxl: "h-14 px-10",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        "relative isolate overflow-hidden",
        liquidbuttonVariants({ variant, size, className })
      )}
      {...props}
    >
      <div className="absolute inset-0 z-0 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.18),0_8px_22px_rgba(0,0,0,0.28),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.55),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.35),inset_0_0_8px_4px_rgba(255,255,255,0.08),0_0_18px_rgba(216,198,160,0.18)] transition-all" />
      <div
        className="absolute inset-0 -z-10 overflow-hidden rounded-full bg-white/[0.055]"
        style={{ backdropFilter: 'url("#container-glass") blur(12px)' }}
      />
      <div className="absolute inset-[1px] z-0 rounded-full bg-gradient-to-b from-white/18 via-white/7 to-white/3" />
      <div className="pointer-events-none relative z-10">
        {children}
      </div>
      <GlassFilter />
    </Comp>
  )
}

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton }
