"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

import { formatPrice } from "@/lib/data";
import { useCart } from "@/components/cart-context";
import { createClient } from "@/utils/supabase/client";

export function ProductsSection() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchLatestProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    
    fetchLatestProducts();
  }, [supabase]);

  return (
    <section className="py-20 px-4 md:px-6 bg-background relative z-10">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-center"
          >
            Latest <span className="text-primary">Arrivals</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-primary rounded-full"
          />
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:grid hidden">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-card rounded-xl overflow-hidden border border-border/5 hover:border-primary/50 transition-colors duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">


                    <a href={`/shop/${product.id}`}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      />
                    </a>
                    
                    {product.is_new && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        New
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center z-10">
                        <button className="p-2 bg-white/10 hover:bg-primary text-primary-foreground rounded-full backdrop-blur-md transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => addToCart(product)}
                          className="p-2 bg-white/10 hover:bg-primary text-primary-foreground rounded-full backdrop-blur-md transition-colors ml-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
                    <a href={`/shop/${product.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                    </a>
                    <p className="text-foreground/80 font-bold">{formatPrice(product.price)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="snap-center shrink-0 w-[280px] group relative bg-card rounded-xl overflow-hidden border border-border/5"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">

                    <a href={`/shop/${product.id}`}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    </a>
                    
                    {product.is_new && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        New
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
                    <a href={`/shop/${product.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                    </a>
                    <div className="flex justify-between items-center">
                      <p className="text-foreground/80 font-bold">{formatPrice(product.price)}</p>
                      <button 
                        onClick={() => addToCart(product)}
                        className="p-1.5 bg-white/5 hover:bg-primary text-primary-foreground rounded-full transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
