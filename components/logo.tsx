"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Logo () {
  const pathname = usePathname ()
  const router = useRouter()


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
      aria-lable="Go to homepage"
      className="cursor-pointer"
    >
      <img src="/logo.jpg" alt="Logo" className="h-10" />
    </button>  
  )
}