"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Nebula Hoodie",
    price: "$89.00",
    category: "Streetwear",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    isNew: true,
  },
  {
    id: 2,
    name: "Void Runner V2",
    price: "$145.00",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
    isNew: true,
  },
  {
    id: 3,
    name: "Cyber Punk Jacket",
    price: "$210.00",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028919-30164bdc5800?auto=format&fit=crop&q=80&w=800",
    isNew: false,
  },
  {
    id: 4,
    name: "Neon Soul Tee",
    price: "$45.00",
    category: "T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    isNew: true,
  },
];

export function ProductsSection() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:grid hidden">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">


                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {product.isNew && (
                  <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    New
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center z-10">
                    <button className="p-2 bg-white/10 hover:bg-primary text-white rounded-full backdrop-blur-md transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-primary text-white rounded-full backdrop-blur-md transition-colors ml-2">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-white/80 font-bold">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-center shrink-0 w-[280px] group relative bg-card rounded-xl overflow-hidden border border-white/5"
            >
               <div className="relative aspect-[3/4] overflow-hidden bg-muted">

                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {product.isNew && (
                  <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    New
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-white/80 font-bold">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
