"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useApiWithStore } from "@/hooks/useApiWithStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);
  const { oauthCallback } = useApiWithStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauth_verifier = searchParams.get("oauth_verifier");
    const oauth_token = searchParams.get("oauth_token");
    if (!oauth_verifier || !oauth_token) {
      setError("Missing OAuth parameters.");
      return;
    }
    (async () => {
      try {
        const data = await oauthCallback(oauth_verifier, oauth_token);
        if (data.token) {
          setToken(data.token);
          router.replace("/");
        } else {
          setError("No token received from server.");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    })();
  }, [searchParams, setToken, router, oauthCallback]);

  if (error) {
    return <div className="p-8 text-center text-red-600">Auth failed: {error}</div>;
  }
  return <div className="p-8 text-center">Authenticating...</div>;
} 