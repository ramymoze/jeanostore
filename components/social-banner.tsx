"use client";

import { motion } from "framer-motion";
import { Instagram, ArrowRight } from "lucide-react";

export function SocialBanner() {
  return (
    <section className="py-12 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
           <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
             Join the inner circle.
           </h3>
           <span className="hidden md:inline-block w-px h-8 bg-white/30" />
           <p className="text-white/80 font-medium">
             Follow us for exclusive drops and behind-the-scenes.
           </p>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-transform active:scale-95 shadow-lg shadow-black/10"
          >
            <Instagram className="w-5 h-5" />
            <span>@jeanostar</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-2 px-6 py-3 bg-black/20 text-white border border-white/20 rounded-full font-bold hover:bg-black/30 transition-transform active:scale-95 backdrop-blur-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
            <span>@jeano_vibe</span>
          </a>
        </div>

      </div>
    </section>
  );
}
