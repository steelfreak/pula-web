"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip-info";

/**
 * Props for the GuessContribute component
 */
interface GuessContributeProps {
  /** Whether the dialog is currently open */
  open: boolean;
  /** Callback function triggered when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * A modal dialog that prompts users to log in when they attempt to contribute
 * audio without being authenticated. Displays login prompt and handles
 * authentication flow redirection.
 *
 * @example
 * ```
 * <GuessContribute open={isDialogOpen} onOpenChange={setIsDialogOpen} />
 * ```
 *
 * @param props - Component props
 * @param props.open - Controls the visibility of the dialog
 * @param props.onOpenChange - Handler for dialog open/close state changes
 * @returns Dialog component when user is unauthenticated, null when authenticated
 */
export default function GuessContribute({
  open,
  onOpenChange,
}: GuessContributeProps): React.ReactElement | null {
  // Select authentication state from Zustand store
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);
  
  // Custom hook for API calls with store integration
  const { login } = useApiWithStore();

  /**
   * Hydrates the authentication store on component mount
   */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /**
   * Handles the login process by calling the login API and redirecting
   * the user to the authentication provider if successful
   */
  const handleLogin = async (): Promise<void> => {
    const data = await login();
    if (data?.redirect_string) {
      window.location.href = data.redirect_string;
    }
  };

  // Render null if user is already authenticated
  if (token) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-8">
        <DialogHeader className="text-left mb-6">
          <DialogTitle className="text-2xl font-bold">
            Login to continue
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-base text-foreground font-medium">
              Please log in to contribute
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You need to be logged in to record audio contributions.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              className="flex-1"
              data-testid="login-button"
            >
              Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
