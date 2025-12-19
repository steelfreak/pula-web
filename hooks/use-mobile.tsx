import * as React from "react"

/**
 * Custom React hook to detect if the current viewport is mobile-sized.
 * 
 * Returns `true` if the window width is less than 768px (mobile breakpoint),
 * `false` otherwise. Uses `window.matchMedia` for responsive detection and
 * updates automatically on window resize.
 * 
 * @example
 * ```
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileLayout />
 *       ) : (
 *         <DesktopLayout />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 * 
 * @returns {boolean} `true` if viewport width < 768px, `false` otherwise
 * 
 * @remarks
 * - Initially returns `false` until first render completes
 * - Automatically cleans up event listeners on unmount
 * - Client-side only (will return `false` during SSR)
 */
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
