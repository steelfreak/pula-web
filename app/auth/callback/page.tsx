"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { useAuthStore } from "@/lib/stores/authStore";

// Prevent pre-rendering during build time
/**
 * Next.js rendering configuration.
 * Forces dynamic rendering to prevent pre-rendering during build time.
 * @type {'force-dynamic'}
 */
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthCallback } = useApiWithStore();
  const { setToken, setUsername, setPrefLangs } = useAuthStore();

  /**
   * Handles OAuth callback authentication flow.
   * Extracts OAuth parameters from URL, retrieves request token from localStorage,
   * calls the OAuth callback API, updates auth store with received credentials,
   * cleans up storage, and redirects to home page.
   *
   * @param {URLSearchParams} searchParams - Next.js search params containing OAuth verifier and token
   * @param {ReturnType<typeof useRouter>} router - Next.js router instance for navigation
   * @param {(requestToken: string, queryString: string) => Promise<{token: string, username: string, pref_langs: string[]}>} oauthCallback - API hook function to exchange request token for access token
   * @param {(token: string) => void} setToken - Auth store setter for access token
   * @param {(username: string) => void} setUsername - Auth store setter for username
   * @param {(prefLangs: string[]) => void} setPrefLangs - Auth store setter for preferred languages array
   * @returns {Promise<void>} Resolves when authentication completes successfully
   * @throws {Error} When OAuth parameters, request token, or server response are missing/invalid
   * @sideEffects Updates auth store state, modifies localStorage, performs page navigation
   */
  const handleAuth = useCallback(async () => {
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

  }, [searchParams, router, oauthCallback, setToken, setUsername, setPrefLangs]);

  /**
   * Initializes authentication on component mount.
   * Calls handleAuth and catches any errors, displaying them in the UI status element.
   *
   * @param {() => Promise<void>} handleAuth - Memoized authentication handler function
   * @returns {void}
   * @sideEffects Updates DOM element attribute with error message on failure
   */
  useEffect(() => {
    handleAuth().catch(err => {
      // Show error message in UI
      const message = err instanceof Error ? err.message : "Unknown error";
      document.getElementById("status")?.setAttribute("data-error", message);
    });
  }, [handleAuth]);

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