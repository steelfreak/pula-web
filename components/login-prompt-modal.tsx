"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Props for the LoginPromptModal component.
 * @interface LoginPromptModalProps
 * @property {boolean} open - Controls the visibility state of the modal dialog.
 * @property {(open: boolean) => void} onOpenChange - Callback function triggered when the dialog open state changes.
 */
interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * LoginPromptModal is a controlled modal dialog that prompts users to log in with their Wikimedia account
 * to access the Recording Studio. It handles the login flow by calling the authentication API and redirecting
 * to Wikimedia's OAuth flow upon successful login initiation.
 * 
 * @component
 * @param {LoginPromptModalProps} props - Component props.
 * @returns {JSX.Element} The rendered modal dialog with login prompt and action buttons.
 */
export default function LoginPromptModal({
  open,
  onOpenChange,
}: LoginPromptModalProps) {

  const { login } = useApiWithStore();
  const hydrate = useAuthStore((state) => state.hydrate);

  const handleLogin = async () => {
    try {
      const data = await login();
      if (data.redirect_string) {
        // Store request_token for use in callback
        if (typeof window !== 'undefined') {
          localStorage.setItem('request_token', data.request_token);
        }
        window.location.href = data.redirect_string;
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Login Required
          </DialogTitle>
          <DialogDescription>
            You need to log in to access the Recording Studio. Please log in with your Wikimedia account to continue contributing audio translations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Why do I need to log in?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Save your recording progress</li>
              <li>• Contribute to Wikimedia Commons</li>
              <li>• Track your contributions</li>
              <li>• Access the full recording interface</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login with Wikimedia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
