"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(8);
        
      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, supabase]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col"
        >
          <div className="container mx-auto px-4 pt-8 md:pt-16 pb-4">
            <div className="flex items-center justify-between gap-4 border-b border-border/20 pb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-2xl md:text-4xl font-medium outline-none placeholder:text-muted-foreground/50"
              />
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-8 overflow-y-auto max-h-[calc(100vh-160px)] pb-20 scrollbar-hide">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : query && results.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No products found matching "{query}"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        href={`/shop/${product.id}`}
                        onClick={onClose}
                        className="group flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/5 hover:border-primary/50 transition-colors"
                      >
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-primary font-medium">{product.category}</p>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-bold">{formatPrice(product.price)}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
