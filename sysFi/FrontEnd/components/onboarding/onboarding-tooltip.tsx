"use client"

import { type ReactNode, useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OnboardingTooltipProps {
  id: string
  content: string
  children: ReactNode
  show: boolean
  position?: "top" | "right" | "bottom" | "left"
}

export function OnboardingTooltip({ id, content, children, show, position = "top" }: OnboardingTooltipProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !show) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={position}
          className="bg-primary text-primary-foreground border-primary"
          data-onboarding-id={id}
        >
          <div className="max-w-xs">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

