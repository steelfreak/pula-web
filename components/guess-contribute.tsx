"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuessContributeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GuessContribute({
  open,
  onOpenChange,
}: GuessContributeProps) {
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);
  const { login } = useApiWithStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogin = async () => {
    const data = await login();
    if (data.redirect_string) {
      window.location.href = data.redirect_string;
    }
  };

  if (!token) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <h2 className="text-xl font-semibold">
              Please log in to contribute
            </h2>
            <p className="text-gray-600">
              You need to be logged in to record audio contributions.
            </p>
            <Button onClick={handleLogin}>Login</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
