"use client";

/**
 * Type import for React to ensure proper typing
 * @type {typeof import("react")}
 */
import type React from "react";

/**
 * Onboarding wrapper component that renders the onboarding tour
 * alongside page content. Ensures tour appears above all other content.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render below onboarding
 * @returns {JSX.Element} Fragment containing Onboarding component and children
 */
import Onboarding from "@/components/onboarding";

export default function OnboardingWrapper({
  children,
}: {
  /** Page content rendered below the onboarding tour */
  children: React.ReactNode;
}) {
  return (
    <>
      <Onboarding />
      {children}
    </>
  );
}
