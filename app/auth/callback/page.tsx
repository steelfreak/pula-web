"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useAuthStore } from "@/lib/stores/authStore";

// Prevent pre-rendering during build time
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthCallback } = useApiWithStore();
  const { setToken, setUsername, setPrefLangs } = useAuthStore();

  const handleAuth = async () => {
    const oauth_verifier = searchParams.get("oauth_verifier");
    const oauth_token = searchParams.get("oauth_token");
    
    if (!oauth_verifier || !oauth_token) {
      throw new Error("Missing OAuth parameters.");
    }

    // Get request_token from localStorage
    const request_token = localStorage.getItem('request_token');
    if (!request_token) {
      throw new Error("Missing request token.");
    }

    // Construct query string from URL parameters
    const query_string = `oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`;

    const data = await oauthCallback(request_token, query_string);
    if (!data.token) {
      throw new Error("No token received from server.");
    }

    setToken(data.token);
    setUsername(data.username);
    setPrefLangs(data.pref_langs);
    // Clean up request_token
    localStorage.removeItem('request_token');
    router.replace("/");

  };

  // Inline effect without useEffect/useCallback
  if (typeof window !== 'undefined') {
    handleAuth().catch(err => {
      // Show error message in UI
      const message = err instanceof Error ? err.message : "Unknown error";
      document.getElementById("status")?.setAttribute("data-error", message);
    });
  }

  return (
    <div id="status" className="p-8 text-center" data-error="">
      {(document.getElementById("status")?.getAttribute("data-error") || "").length > 0 ? (
        <div className="text-red-600">
          Auth failed: {document.getElementById("status")?.getAttribute("data-error")}
        </div>
      ) : (
        "Authenticating..."
      )}
    </div>
  );
}
