"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

export function SocialBanner() {
  const { t } = useLanguage();
  return (
    <section className="py-12 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
           <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
             {t("social.title")}
           </h3>
           <span className="hidden md:inline-block w-px h-8 bg-white/30" />
           <p className="text-foreground/80 font-medium">
             {t("social.subtitle")}
           </p>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://www.instagram.com/silverwear_dz?igsh=MTluYzltNm1ydjI1dg%3D%3D&utm_source=qr" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-transform active:scale-95 shadow-lg shadow-black/10"
          >
            <Instagram className="w-5 h-5" />
            <span>@silverwear_dz</span>
          </a>
          
          <a 
            href="https://www.facebook.com/share/1912fhK8cv/?mibextid=wwXIfr" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-transform active:scale-95 shadow-lg shadow-black/10"
          >
            <Facebook className="w-5 h-5" />
            <span>Silverwear</span>
          </a>
          
          <a 
            href="https://www.tiktok.com/@silver.wear1?_r=1&_t=ZS-98MsNXsmBID" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-background/20 text-foreground border border-border/20 rounded-full font-bold hover:bg-background/30 transition-transform active:scale-95 backdrop-blur-sm"
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
            <span>@silver.wear1</span>
          </a>
        </div>

      </div>
    </section>
  );
}
