"use client";

import { useState, useEffect, useRef } from 'react';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-right' | 'slide-left' | 'slide-right' | 'zoom-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
}

const ScrollReveal = ({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  duration = 700, 
  className = '' 
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 } // Triggers when 15% visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransforms = () => {
    switch (animation) {
      case 'fade-up': return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
      case 'fade-down': return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10';
      case 'fade-right': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
      case 'slide-left': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
      case 'slide-right': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
      case 'zoom-in': return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm';
      default: return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out transform ${getTransforms()} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;