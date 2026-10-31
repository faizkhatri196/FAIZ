// Ambient Type Declarations for Faiz Khatri Portfolio

declare const THREE: any;
declare const Lenis: any;
declare const gsap: any;
declare const ScrollTrigger: any;

interface Window {
  locale_en?: Record<string, any>;
  locale_hi?: Record<string, any>;
  locale_ja?: Record<string, any>;
  locale_es?: Record<string, any>;
  [key: string]: any;
}

declare namespace NodeJS {
  interface Global {
    window: any;
  }
}

