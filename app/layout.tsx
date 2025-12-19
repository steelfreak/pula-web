import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/tooltip-provider"


/**
 * Root layout component for the PULA application.
 * Provides global metadata, font configuration, and wraps the app with TooltipProvider.
 * This is the top-level layout used by Next.js App Router.
 *
 * @module RootLayout
 */

/**
 * Inter font configuration with Latin subset support.
 * Loaded via Next.js Google Fonts for optimal performance.
 */
const inter = Inter({ subsets: ["latin"] })


/**
 * Metadata object for the PULA application.
 * Defines SEO properties, OpenGraph data, and page information.
 */
export const metadata: Metadata = {

  /**
   * Page title displayed in browser tab and search results.
   */
  title: "PULA - People's Universal Lexical Access",

  /**
   * Meta description for search engines and social sharing.
   */
  description: "Easy translation from any base language to any target language",

  /**
   * Application authors with link to GitHub repository.
   * @type {Array<{name: string, url: string}>}
   */
  authors: [{ name: "PULA", url: "https://github.com/agpb" }],

  /**
   * Keywords for search engine optimization.
   */
  keywords: ["translation", "language", "phrase book", "German", "African"],

  /**
   * Robots meta tag configuration allowing indexing and following.
   */
  robots: "index, follow",


  /**
   * OpenGraph metadata for social media sharing.
   * @property {string} title - OpenGraph title
   * @property {string} description - OpenGraph description
   */
  openGraph: {
    title: "PULA - People's Universal Lexical Access",
    description: "Easy translation from any base language to any target language",
  }
}


/**
 * Root layout component that wraps all pages of the PULA application.
 * 
 * Renders the HTML structure with:
 * - English language attribute
 * - Inter font className applied to body
 * - TooltipProvider wrapping all child content
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to be rendered within the layout
 * @returns {JSX.Element} HTML document structure with wrapped children
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
