"use client"

import { useEffect, useState } from "react"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApiWithStore } from "@/hooks/useApiWithStore"
import { useAuthStore } from "@/lib/stores/authStore"
import type { AuthState } from '@/lib/stores/authStore';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { login, logout } = useApiWithStore();
  const token = useAuthStore((state: AuthState ) => state.token);
  const hydrate = useAuthStore((state: AuthState ) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogin = async () => {
    const data = await login();
    if (data.redirect_string) {
      window.location.href = data.redirect_string;
    }
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white" style={{ borderColor: "#a2a9b1" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium cursor-pointer" style={{ color: "#222222" }}>
                <a href="/">
                  <img src="/logo.jpg" alt="Logo" className="h-10" />
                </a>
              </div>
            </div>
            <div className="hidden sm:block h-6 w-px" style={{ backgroundColor: "#a2a9b1" }} />
            <h1 className="hidden sm:block text-lg font-medium" style={{ color: "#222222" }}>
              Lexeme Search
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* <a
              href="#"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: "#0645ad" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0080")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0645ad")}
            >
              Help
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: "#0645ad" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0080")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0645ad")}
            >
              About
            </a> */}
            <a
              href="/contribute"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: "#0645ad" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0080")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0645ad")}
            >
              Record Studio
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 transition-colors" style={{ color: "#72777d" }}>
              <User className="w-5 h-5" />
            </button>
            <Button
              variant="outline"
              onClick={token ? handleLogout : handleLogin}
            >
              {token ? "Logout" : "Login"}
            </Button>
            <button
              className="md:hidden p-2 transition-colors"
              style={{ color: "#72777d" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: "#a2a9b1" }}>
            <nav className="flex flex-col space-y-2">
              <a
                href="#"
                className="text-sm font-medium py-2 transition-colors hover:underline"
                style={{ color: "#0645ad" }}
              >
                Help
              </a>
              <a
                href="#"
                className="text-sm font-medium py-2 transition-colors hover:underline"
                style={{ color: "#0645ad" }}
              >
                About
              </a>
              <a
                href="#"
                className="text-sm font-medium py-2 transition-colors hover:underline"
                style={{ color: "#0645ad" }}
              >
                Contribute
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
