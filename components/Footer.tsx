"use client";

export default function Footer() {
  return (
    <footer className="w-full py-24 border-t border-white/5 mt-32">
      {/* 
          We use a centered container (max-w-6xl mx-auto) to match the rest of your site.
          The 'flex-col items-center' ensures the vertical stack is centered.
      */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-16">
        
        {/* 
            Row Container: 
            On desktop, we use 'relative' so we can position the logo absolutely to the left
            without affecting the center-alignment of the social icons.
        */}
        <div className="relative w-full flex flex-col md:flex-row items-center justify-center min-h-[32px] gap-8 md:gap-0">
          
          {/* Logo Section - Locked to the left on desktop, centered on mobile */}
          <div className="md:absolute md:left-0 text-xl font-black tracking-tighter text-white">
            MADNER<span className="text-gray-500">.</span>
          </div>

          {/* Social Links - GUARANTEED DEAD CENTER OF THE SCREEN */}
          <div className="flex items-center gap-12">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            
            <a href="mailto:hello@madner.studio" className="text-gray-500 hover:text-white transition-colors" aria-label="Email">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>

        {/* Copyright - STRICTLY CENTERED */}
        <div className="w-full pt-8 border-t border-white/[0.02] flex justify-center">
          <p className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-700 text-center">
            © 2026 MADNER STUDIO // ALL RIGHTS RESERVED
          </p>
        </div>

      </div>
    </footer>
  );
}
