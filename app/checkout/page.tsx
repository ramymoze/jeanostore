"use client";

import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, PackageCheck } from "lucide-react";

// Delivery price mapping per wilaya (prices in DZD)
const DELIVERY_RATES: Record<string, { domicile: number; bureau: number }> = {
  "Adrar": { domicile: 1400, bureau: 1000 },
  "Chlef": { domicile: 800, bureau: 500 },
  "Laghouat": { domicile: 900, bureau: 700 },
  "Oum El Bouaghi": { domicile: 700, bureau: 500 },
  "Batna": { domicile: 700, bureau: 500 },
  "Béjaïa": { domicile: 700, bureau: 500 },
  "Biskra": { domicile: 900, bureau: 600 },
  "Béchar": { domicile: 1100, bureau: 700 },
  "Blida": { domicile: 750, bureau: 500 },
  "Bouira": { domicile: 750, bureau: 500 },
  "Tamanrasset": { domicile: 1600, bureau: 1100 },
  "Tébessa": { domicile: 800, bureau: 500 },
  "Tlemcen": { domicile: 900, bureau: 600 },
  "Tiaret": { domicile: 800, bureau: 500 },
  "Tizi Ouzou": { domicile: 700, bureau: 500 },
  "Alger": { domicile: 600, bureau: 500 },
  "Djelfa": { domicile: 900, bureau: 600 },
  "Jijel": { domicile: 700, bureau: 500 },
  "Sétif": { domicile: 700, bureau: 500 },
  "Saïda": { domicile: 800, bureau: 600 },
  "Skikda": { domicile: 700, bureau: 500 },
  "Sidi Bel Abbès": { domicile: 800, bureau: 500 },
  "Annaba": { domicile: 500, bureau: 400 },
  "Guelma": { domicile: 700, bureau: 500 },
  "Constantine": { domicile: 700, bureau: 500 },
  "Médéa": { domicile: 800, bureau: 500 },
  "Mostaganem": { domicile: 800, bureau: 500 },
  "M'Sila": { domicile: 800, bureau: 500 },
  "Mascara": { domicile: 800, bureau: 500 },
  "Ouargla": { domicile: 1000, bureau: 700 },
  "Oran": { domicile: 800, bureau: 500 },
  "El Bayadh": { domicile: 1000, bureau: 700 },
  "Bordj Bou Arreridj": { domicile: 700, bureau: 500 },
  "Boumerdès": { domicile: 800, bureau: 500 },
  "El Tarf": { domicile: 600, bureau: 500 },
  "Naâma": { domicile: 1100, bureau: 700 },
  "Aïn Témouchent": { domicile: 800, bureau: 500 },
  "Ghardaïa": { domicile: 1000, bureau: 700 },
  "Relizane": { domicile: 800, bureau: 500 },
  "Timimoun": { domicile: 1400, bureau: 0 },
  "Ouled Djellal": { domicile: 900, bureau: 700 },
  "Béni Abbès": { domicile: 1000, bureau: 900 },
  "Touggourt": { domicile: 1000, bureau: 800 },
  "El M'Ghair": { domicile: 900, bureau: 0 },
  "El Meniaa": { domicile: 1000, bureau: 0 },
};

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n-context";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedDeliveryMod, setSelectedDeliveryMod] = useState("Domicile");
  const supabase = createClient();

  const currentDeliveryCost = useMemo(() => {
    const foundWilaya = Object.keys(DELIVERY_RATES).find(k => k.toLowerCase() === selectedWilaya.toLowerCase().trim());
    return foundWilaya ? DELIVERY_RATES[foundWilaya][selectedDeliveryMod.toLowerCase() as 'domicile' | 'bureau'] : 0;
  }, [selectedWilaya, selectedDeliveryMod]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const phone_2 = formData.get("phone_2") as string;
      const wilaya = formData.get("wilaya") as string;
      const commune = formData.get("commune") as string;
      const adresse = formData.get("adresse") as string;
      const delivery_mod = formData.get("delivery_mod") as string;

      const baseOrderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);

      const deliveryCost = currentDeliveryCost;

      const orderRows = items.map((item, index) => {
        return {
          order_id: items.length > 1 ? `${baseOrderId}-${index + 1}` : baseOrderId,
          name,
          phone,
          phone_2,
          wilaya,
          commune,
          adresse,
          product: item.name,
          product_var: item.category || "Standard",
          quantity: item.quantity,
          product_pr: item.price,
          delivery_pric: deliveryCost,
          total_price: (item.price * item.quantity) + deliveryCost,
          delivery_mod: delivery_mod || "Domicile",
        };
      });

      const { error } = await supabase.from('orders').insert(orderRows);

      if (error) throw error;

      // Build a separate clean payload for Google Sheets
      const sheetsRows = items.map((item, index) => {
        return {
          ORDER_ID: items.length > 1 ? `${baseOrderId}-${index + 1}` : baseOrderId,
          NAME: name,
          PHONE: phone,
          PRODUCT: item.name,
          QUANTITY: item.quantity,
          TOTAL_PRICE: (item.price * item.quantity),
          WILAYA: wilaya,
          COMMUNE: commune,
          DELIVERY_MODE: delivery_mod || "Domicile",
        };
      });

      // Sync with Google Sheets securely
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: sheetsRows }),
        });
      } catch (sheetError) {
        console.error("Failed to sync to Google Sheets:", sheetError);
      }

      clearCart();
      router.push("/checkout/success");
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error(`Error placing order: ${error.message || "Unknown database error"}`);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground pt-32 px-4 flex flex-col items-center">
        <PackageCheck className="w-20 h-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our collection to find your next favorite outfit.
        </p>
        <Link href="/shop" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-full transition-colors">
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("checkout.continue")}
          </Link>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-10"
        >
          {t("checkout.title")}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Order Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="bg-card border border-border/5 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/10">
                <Truck className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{t("checkout.shippingInfo")}</h2>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
                <p className="text-sm font-medium text-primary">
                  {t("checkout.payOnDelivery")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">{t("checkout.fullName")}</label>
                    <input 
                      required
                      type="text" 
                      id="name" 
                      name="name"
                      className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                      placeholder="محمد بن عمر"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">{t("checkout.phone")}</label>
                      <input 
                        required
                        type="tel" 
                        id="phone" 
                        name="phone"
                        className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                        placeholder="0555 00 00 00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone_2" className="text-sm font-medium text-muted-foreground">{t("checkout.phone2")}</label>
                      <input 
                        type="tel" 
                        id="phone_2" 
                        name="phone_2"
                        className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                        placeholder="0770 00 00 00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="wilaya" className="text-sm font-medium text-muted-foreground">{t("checkout.wilaya")}</label>
                      <input 
                        required
                        type="text" 
                        id="wilaya" 
                        name="wilaya"
                        list="wilayas-list"
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                        placeholder="Type or select a wilaya..."
                      />
                      <datalist id="wilayas-list">
                        {Object.keys(DELIVERY_RATES).map((w) => (
                          <option key={w} value={w} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="commune" className="text-sm font-medium text-muted-foreground">{t("checkout.commune")}</label>
                      <input 
                        required
                        type="text" 
                        id="commune" 
                        name="commune"
                        className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                        placeholder="Type your commune..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="adresse" className="text-sm font-medium text-muted-foreground">{t("checkout.address")}</label>
                    <input 
                      required
                      type="text" 
                      id="adresse" 
                      name="adresse"
                      className="w-full bg-background/40 border border-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t("checkout.deliveryMode")}</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <label className="flex items-center gap-3 p-4 border border-border/10 rounded-xl cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <input type="radio" name="delivery_mod" value="Bureau" checked={selectedDeliveryMod === "Bureau"} onChange={(e) => setSelectedDeliveryMod(e.target.value)} className="accent-primary" required />
                        <span className="font-medium">{t("checkout.bureau")}</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-border/10 rounded-xl cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <input type="radio" name="delivery_mod" value="Domicile" checked={selectedDeliveryMod === "Domicile"} onChange={(e) => setSelectedDeliveryMod(e.target.value)} className="accent-primary" required />
                        <span className="font-medium">{t("checkout.domicile")}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl mt-8 flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-border/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>{t("checkout.placeOrder")}</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-background/40 backdrop-blur-md border border-border/10 rounded-2xl p-6 md:p-8 sticky top-32">
              <h2 className="text-2xl font-bold mb-6">{t("summary.title")}</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{t("summary.qty")}: {item.quantity}</p>
                      <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/10 pt-4 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("summary.subtotal")}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("summary.shipping")}</span>
                  <span>{currentDeliveryCost > 0 ? formatPrice(currentDeliveryCost) : "---"}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border/10">
                  <span>{t("summary.total")}</span>
                  <span className="text-primary">{formatPrice(cartTotal + currentDeliveryCost)}</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
