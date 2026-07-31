"use client";

import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-background to-background">
      <div className="absolute inset-0 w-full h-full bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[64px] md:blur-[120px] -z-10 opacity-50 pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
            <img src="/logo.png" alt="Silverwear Logo" className="w-40 h-40 rounded-full object-cover mb-6 shadow-2xl shadow-primary/20" />
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
              {t("hero.badge")}
            </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-foreground"
        >
          Silver<span className="text-primary">wear</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/shop" className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/25">
            <ShoppingBag className="w-4 h-4" />
            {t("hero.shopNow")}
          </Link>
          <a href="#collections" className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground border border-border/10 font-medium hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 group backdrop-blur-sm">
            {t("hero.explore")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1.5, duration: 1 },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-muted-foreground"
      >
        <span className="text-sm uppercase tracking-widest font-medium">{t("hero.scroll")}</span>
        <div className="w-[2px] h-24 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
