"use client";

import { Loader2 } from "lucide-react";

/**
 * A conditional spinner component that displays loading content and/or a spinning icon.
 * Useful for buttons, forms, or any UI element that needs loading states.
 *
 * @example
 * ```
 * // Just spinner
 * <Spinner loading={true} />
 *
 * // With text content
 * <Spinner loading={true} content="Saving..." />
 *
 * // With custom styling
 * <Spinner 
 *   loading={true} 
 *   content="Loading..." 
 *   extraClass="text-blue-500" 
 * />
 * ```
 *
 * @param {boolean} loading - Controls visibility of the spinner icon
 * @param {string} [content] - Optional text content displayed alongside spinner
 * @param {string} [extraClass] - Optional Tailwind CSS classes for additional spinner styling
 * @returns {JSX.Element} Spinner with conditional content and loading icon
 */
export default function Spinner({
  loading,
  content,
  extraClass,
}: {
  loading: boolean;
  content?: string;
  extraClass?: string;
}) {
  
  return (
    <>
      {content && <span>{content}</span>}
      {loading && (
      <Loader2
        className={`ml-4 h-6 w-6 animate-spin ${extraClass}`}
          style={{ color: "#72777d", bottom: "3px", position: "relative" }}
        />
      )}
    </>
  );
}
