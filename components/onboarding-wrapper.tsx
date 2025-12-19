"use client";

import type React from "react";
import Onboarding from "@/components/onboarding";

export default function OnboardingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Onboarding />
      {children}
    </>
  );
}
