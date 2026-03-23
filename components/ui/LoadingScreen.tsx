'use client';

/**
 * CODE ENGINEERING & CACHE STRUCTURE OPTIMIZATION:
 * 
 * 1. PERSISTENCE STRATEGY (Session-based):
 *    - Implemented a 'first-visit-only' logic using `sessionStorage` ('papaya-visited').
 *    - This ensures the heavy loading sequence only triggers once per session,
 *      maintaining high UX performance for return navigations/refreshes.
 * 
 * 2. FLASH OF CONTENT (FOC) MITIGATION:
 *    - Added `hasMounted` state and a pre-hydration return of the theme background.
 *    - This prevents the browser from rendering the landing page for a split-second
 *      before the client-side React logic takes over.
 * 
 * 3. PERFORMANCE ARCHITECTURE:
 *    - Centralized loading state in a wrapper component to decouple assets 
 *      from the main landing page lifecycle.
 *    - Optimized CSS keyframes for hardware acceleration (using transform/opacity).
 */

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Check if user has visited before in this session
    const hasVisited = sessionStorage.getItem('papaya-visited');
    
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    // First visit - show loading screen
    sessionStorage.setItem('papaya-visited', 'true');
    
    // Start fade out after 2 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Remove loading screen after 3 seconds
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Prevent flash of content by returning the loading background color before mounting
  if (!hasMounted) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#3D6B4F]" />
    );
  }

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#3D6B4F] transition-opacity duration-1000 ease-out ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Subtle animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3D6B4F] via-[#456F53] to-[#3D6B4F] animate-gradient-shift opacity-50" />
          
          <div className={`flex flex-col items-center gap-12 relative z-10 transition-all duration-1000 ${isFadingOut ? 'scale-110 blur-sm' : 'scale-100 blur-0 animate-content-in'}`}>
            {/* Logo with subtle breathing animation */}
            <div className={`relative transition-all duration-700 ${isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white/10 animate-breathe">
                <Image
                  src="/images/papaya.jpg"
                  alt="Papaya Academy Logo"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              {/* Subtle orbit dot */}
              <div className="absolute inset-0 animate-orbit">
                <div className="w-3 h-3 bg-[#F2C94C] rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#F2C94C]" />
              </div>
            </div>

            {/* Academy name with staggered letter animation */}
            <div className={`text-center transition-all duration-700 delay-200 ${isFadingOut ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <h2 className="text-white text-2xl md:text-4xl font-light tracking-[0.25em] uppercase flex flex-wrap justify-center">
                {"Papaya Academy".split("").map((char, index) => (
                  <span
                    key={index}
                    className="inline-block animate-text-reveal"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      minWidth: char === " " ? "0.5em" : "auto"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h2>
            </div>

            {/* Unique loading indicator - bouncing dots */}
            <div className={`flex items-center justify-center gap-4 transition-all duration-500 delay-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3.5 h-3.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F2C94C] animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="w-3.5 h-3.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.45s' }} />
                <div className="w-3.5 h-3.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - hidden while loading, then faded in */}
      <div
        className={`transition-opacity duration-1000 ease-out ${
          isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
        }`}
      >
        {children}
      </div>
    </>
  );
}

