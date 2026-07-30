"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useLanguage } from "@/lib/i18n-context";

export default function CheckoutSuccessPage() {
  const { t } = useLanguage();
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
      {isClient && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <ReactConfetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ffffff']}
          />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg bg-card/50 backdrop-blur-xl p-10 rounded-3xl border border-border/10 shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{t("success.title")}</h1>
        <p className="text-muted-foreground text-lg mb-8">
          {t("success.message")}
        </p>

        <div className="bg-background/40 rounded-xl p-6 w-full mb-8 border border-border/5">
          <div className="text-left flex items-center gap-3">
            <Package className="text-primary w-5 h-5" />
            <div>
              <p className="text-sm text-muted-foreground">{t("success.estDelivery")}</p>
              <p className="font-bold text-foreground">{t("success.deliveryTime")}</p>
            </div>
          </div>
        </div>

        <Link href="/shop" className="w-full">
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all group">
            {t("success.continue")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </motion.div>
    </main>
  );
}
