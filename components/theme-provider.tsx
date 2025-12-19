'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * A wrapper component that provides Next Themes context to its children.
 * Enables theme switching (light/dark/system) throughout the component tree.
 * All props from `next-themes` ThemeProvider are supported.
 *
 * @example
 * ```
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <YourApp />
 * </ThemeProvider>
 * ```
 *
 * @param {React.ReactNode} children - The child components that will inherit theme context
 * @param {ThemeProviderProps} [props] - Additional props passed to NextThemesProvider
 * @returns {JSX.Element} ThemeProvider wrapper with children
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
