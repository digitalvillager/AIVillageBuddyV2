import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile size
 * @returns {boolean} True if viewport width is less than 768px
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIsMobile();
    
    // Check on resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return isMobile;
}

/**
 * Hook to detect if the current viewport is smaller than a certain breakpoint
 * @param breakpoint Width in pixels to check against
 * @returns {boolean} True if viewport width is less than the breakpoint
 */
export function useBreakpoint(breakpoint: number): boolean {
  const [isSmaller, setIsSmaller] = useState(false);
  
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsSmaller(window.innerWidth < breakpoint);
    };
    
    // Check on mount
    checkBreakpoint();
    
    // Check on resize
    window.addEventListener('resize', checkBreakpoint);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkBreakpoint);
    };
  }, [breakpoint]);
  
  return isSmaller;
}