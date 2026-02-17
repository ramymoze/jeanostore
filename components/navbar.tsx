"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "#" },
  ];

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled || isMobileMenuOpen
          ? "bg-background/80 backdrop-blur-md border-white/10 py-4 shadow-lg"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-1 group">
            Jeano<span className="text-primary group-hover:text-white transition-colors">star</span>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.4 }}
            >
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button className="p-2 text-muted-foreground hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-white transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button 
            className="p-2 text-muted-foreground hover:text-white transition-colors md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>

        </motion.div>
      </div>
    </motion.nav>

    {isMobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-[49] bg-background pt-24 px-6 md:hidden"
      >
        <div className="flex flex-col gap-6 text-xl font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-muted-foreground hover:text-white transition-colors border-b border-white/5 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </motion.div>
    )}
    </>
  );
}
