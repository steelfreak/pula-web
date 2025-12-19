"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";

/**
 * Interface defining a single tour step configuration
 * @interface
 */
interface TourStep {
  /** CSS selector targeting the element to highlight (or "body") */
  target: string;
  /** Title displayed in tooltip header */
  title: string;
  /** Main descriptive content of the step */
  content: string;
  /** Tooltip position relative to target element */
  placement?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "body",
    title: "Welcome!",
    content: "Welcome to Pula, Let me show you around and explain the key features.",
    placement: "bottom",
  },
  {
    target: "[data-tour='header']",
    title: "Header",
    content: "This is the header with the app logo and navigation. You can access the Record Studio to contribute audio recordings here.",
    placement: "bottom",
  },
  {
    target: "[data-tour='page-title']",
    title: "Getting Started",
    content: "This page helps you explore words and phrases across different languages.",
    placement: "bottom",
  },
  {
    target: "[data-tour='source-language']",
    title: "Source Language",
    content: "Start by selecting your source language - this is the language you want to translate FROM.",
    placement: "bottom",
  },
  {
    target: "[data-tour='target-languages']",
    title: "Target Languages",
    content: "Select one or two target languages - these are the languages you want to translate TO. At least one is required.",
    placement: "bottom",
  },
  {
    target: "[data-tour='search-input']",
    title: "Search",
    content: "Once you've selected your languages, use this search box to find words and phrases. You can search by typing or by selecting from a list.",
    placement: "top",
  },
  {
    target: "body",
    title: "All Set!",
    content: "That's it! You're ready to explore. You can always revisit this tour if you need help. Happy exploring!",
    placement: "bottom",
  },
];

/**
 * Onboarding tour component
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOnboardingVisible - Controls tour visibility from store
 * @param {boolean} props.isOnboardingCompleted - Tracks if user completed tour
 * @param {Function} props.setOnboardingCompleted - Marks tour as completed
 * @param {Function} props.setOnboardingVisible - Toggles tour visibility
 * @param {Function} props.hydrate - Initializes store state
 * @returns {JSX.Element|null} Tour UI or null if hidden/completed
 */
export default function Onboarding() {
  const { isOnboardingVisible, isOnboardingCompleted, setOnboardingCompleted, setOnboardingVisible, hydrate } =
    useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightPos, setHighlightPos] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isOnboardingVisible && !isOnboardingCompleted) {
      setShowTour(true);
    }
  }, [isOnboardingVisible, isOnboardingCompleted]);

  useEffect(() => {
    if (!showTour) return;

    const step = tourSteps[currentStep];
    const element = step.target === "body" ? document.body : document.querySelector(step.target);

    if (element && element !== document.body) {
      const rect = element.getBoundingClientRect();
      setHighlightPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Position tooltip
      let top = rect.top + window.scrollY + rect.height + 20;
      let left = rect.left + window.scrollX + rect.width / 2 - 160;

      if (step.placement === "top") {
        top = rect.top + window.scrollY - 250;
      }

      setTooltipPos({ top, left });
    } else {
      // Center on screen for body steps
      setHighlightPos({ top: 0, left: 0, width: 0, height: 0 });
      setTooltipPos({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 160,
      });
    }
  }, [currentStep, showTour]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    setShowTour(false);
    setOnboardingCompleted(true);
    setOnboardingVisible(false);
  };

  if (isOnboardingCompleted || !showTour) {
    return null;
  }

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        onClick={handleSkip}
      />

      {/* Spotlight highlight */}
      {highlightPos.width > 0 && highlightPos.height > 0 && (
        <div
          className="fixed z-40 border-2 border-white pointer-events-none"
          style={{
            top: `${highlightPos.top - 8}px`,
            left: `${highlightPos.left - 8}px`,
            width: `${highlightPos.width + 16}px`,
            height: `${highlightPos.height + 16}px`,
            borderRadius: "8px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl p-6 max-w-sm"
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
          width: "320px",
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{step.content}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step counter */}
        <div className="text-xs text-gray-500 text-center mb-4">
          Step {currentStep + 1} of {tourSteps.length}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 inline mr-1" />
            Back
          </button>

          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            {currentStep === tourSteps.length - 1 ? (
              "Finish"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
