import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TOKEN_KEY } from "./stores/authStore";
import { ApiError } from "./types/api";

/**
 * Merge class names
 * @param inputs - The class names to merge
 * @returns The merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
   * Convert a Blob to a base64 string
   * @param blob - The Blob to convert
   * @returns A Promise that resolves to the base64 string
   */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


/**
 * Convert a base64 string to a Uint8Array
 * @param base64 - The base64 string to convert
 * @returns A Uint8Array
 */
export const base64ToBytes = (base64: string): Uint8Array => {
  const binaryString = atob(base64.split(',')[1] || base64); // Remove data URI prefix if present
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert a base64 string to a Python byte literal
 * @param base64 - The base64 string to convert
 * @returns A Python byte literal
 */
export const base64ToPythonByteLiteral = (base64: string): string => {
  const bytes = base64ToBytes(base64);
  const asciiString = Array.from(bytes)
    .map((byte) => {
      const char = String.fromCharCode(byte);
      return /[ -~]/.test(char) ? char : `\\x${byte.toString(16).padStart(2, '0')}`;
    })
    .join('');
  return `b'${asciiString}'`;
}

export const checkIf401Error = (error: ApiError) => {
  if (error.status === 401) {
    alert('Unauthorized: Please check your credentials.');
    // localStorage.removeItem(TOKEN_KEY);
    // window.location.href = '/';
  }
}

