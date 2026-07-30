"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductsSection } from "@/components/products-section";
import { Heart, ShoppingCart, Filter, ArrowDownUp, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { formatPrice } from "@/lib/data";
import { useCart } from "@/components/cart-context";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/lib/i18n-context";
import Link from "next/link";

export default function ShopPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, [supabase]);

  const categories = ["All", "Streetwear", "Footwear", "Outerwear", "T-Shirts", "Bottoms", "Accessories"];

  const filteredProducts = products.filter(
    (product) => filter === "All" || product.category === filter
  );

  return (
    <main className="min-h-screen bg-background text-foreground pt-24">

      <div className="container mx-auto px-4 md:px-6 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          {t("shop.title")}
        </motion.h1>
      </div>


      <div className="sticky top-20 z-30 mb-8 md:mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-background/40 backdrop-blur-xl border border-border/10 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            
            <div className="w-full md:w-auto flex items-center overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground mr-2 hidden md:inline-block">
                    <Filter className="w-4 h-4" />
                </span>
                <div className="flex overflow-x-auto gap-2 scrollbar-hide w-full items-center pb-1 md:pb-0 mask-gradient-right">
                    {categories.map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap z-10 ${
                            filter === cat ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                        >
                        {filter === cat && (
                            <motion.div
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {cat === "All" ? t("shop.all") : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group w-full md:w-auto md:min-w-[200px]">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border/10 rounded-full cursor-pointer hover:bg-white/10 transition-colors w-full">
                <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  title="Sort items" 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer appearance-none flex-1 w-full"
                >
                  <option className="bg-card text-foreground" value="Newest">Newest</option>
                  <option className="bg-card text-foreground" value="Price: Low to High">Price: Low to High</option>
                  <option className="bg-card text-foreground" value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative bg-card rounded-xl overflow-hidden border border-border/5 hover:border-primary/50 transition-colors duration-300"
                >
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">

                    <Link href={`/shop/${product.id}`}>
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    />
                    </Link>
                    
                    {product.is_new && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {t("shop.new")}
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
                    <Link href={`/shop/${product.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                    </Link>
                    <p className="text-foreground/80 font-bold">{formatPrice(product.price)}</p>
                    </div>
                </motion.div>
                ))}
            </div>
            
            {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No products found in this category.
                </div>
            )}
          </>
        )}
      </section>
      
      <Footer />
    </main>
  );
}

