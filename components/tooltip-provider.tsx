'use client'

import * as React from 'react'
import { TooltipProvider as RadixTooltipProvider } from '@/components/ui/tooltip'

/**
 * A wrapper component that provides the Radix UI Tooltip context to its children.
 * This enables tooltip functionality throughout the component tree.
 *
 * @example
 * ```
 * <TooltipProvider>
 *   <YourApp />
 * </TooltipProvider>
 * ```
 */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltipProvider>{children}</RadixTooltipProvider>
}
