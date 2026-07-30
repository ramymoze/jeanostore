"use client";

import { use, useState, useEffect } from "react";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/components/cart-context";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/lib/i18n-context";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("M");
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (isNaN(productId)) {
        setLoading(false);
        return;
      }
      
      // Fetch main product
      const { data: pData } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (pData) {
        setProduct(pData);
        
        // Fetch related products
        const { data: rData } = await supabase
          .from('products')
          .select('*')
          .eq('category', pData.category)
          .neq('id', productId)
          .limit(4);
          
        if (rData) setRelatedProducts(rData);
      }
      setLoading(false);
    }
    fetchData();
  }, [productId, supabase]);

  if (!loading && !product) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("shop.back")}
          </Link>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden bg-muted"
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {product.is_new && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {t("shop.new")}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col justify-center"
              >
                <p className="text-primary font-medium tracking-widest uppercase mb-2">
                  {product.category}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-muted-foreground ml-2 text-sm">{t("shop.reviews", { count: 128 })}</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {product.description}
                </p>

                <div className="mb-8">
                  <h3 className="font-medium mb-3">{t("shop.selectSize")}</h3>
                  <div className="flex gap-3">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                          selectedSize === size 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-border/10 hover:border-primary text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("shop.addToCart")}
                </button>
              </motion.div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-24">
                <h2 className="text-3xl font-bold mb-8 text-center md:text-left">{t("shop.related")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Link
                      href={`/shop/${relatedProduct.id}`}
                      key={relatedProduct.id}
                      className="group block bg-card rounded-xl overflow-hidden border border-border/5 hover:border-primary/50 transition-colors"
                    >
                      <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                        <img 
                          src={relatedProduct.image} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-primary font-medium mb-1">{relatedProduct.category}</p>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{relatedProduct.name}</h3>
                        <p className="font-bold">{formatPrice(relatedProduct.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
