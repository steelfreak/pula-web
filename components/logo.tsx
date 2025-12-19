"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * Logo component renders a clickable logo button that navigates to the homepage.
 * Shows a confirmation dialog when leaving the current page (except when already on homepage)
 * to warn about potential loss of unsaved changes or search data.
 */
export default function Logo() {
  /** Current pathname of the application */
  const pathname = usePathname();
  /** Router instance for programmatic navigation */
  const router = useRouter();

  /**
   * Handles logo button click events.
   * - Does nothing if already on homepage (pathname === "/")
   * - Shows confirmation dialog warning about data loss
   * - Navigates to homepage only if user confirms
   */
  const handleLogoClick = () => {
    if (pathname === "/") return

  const confirmed = window.confirm(
    "You are about to return to the homepage.\n\nAny unsaved changes or search data will be lost. Do you want to continue?"
    )

    if (confirmed) {
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleLogoClick}
      aria-label="Go to homepage"
      className="cursor-pointer"
    >
      <img src="/logo.jpg" alt="Logo" className="h-10" />
    </button>  
  )
}