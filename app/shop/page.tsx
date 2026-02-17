"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ProductsSection } from "@/components/products-section";
import { Heart, ShoppingCart, Filter, ArrowDownUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";


const allProducts = [
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
  {
    id: 5,
    name: "Obsidian Cargo Pants",
    price: "$110.00",
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
    isNew: false,
  },
  {
    id: 6,
    name: "Quantum Sneakers",
    price: "$180.00",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800",
    isNew: false,
  },
   {
    id: 7,
    name: "Astral Cap",
    price: "$35.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800",
    isNew: true,
  },
  {
    id: 8,
    name: "Matrix Trench Coat",
    price: "$250.00",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800",
    isNew: false,
  },
];

export default function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  const categories = ["All", "Streetwear", "Footwear", "Outerwear", "T-Shirts", "Bottoms", "Accessories"];

  const filteredProducts = allProducts.filter(
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
          Shop <span className="text-primary">Collection</span>
        </motion.h1>
        <p className="text-muted-foreground text-lg">Discover the future of fashion.</p>
      </div>


      <div className="sticky top-20 z-30 mb-8 md:mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            
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
                            filter === cat ? "text-white" : "text-muted-foreground hover:text-white"
                        }`}
                        >
                        {filter === cat && (
                            <motion.div
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group w-full md:w-auto md:min-w-[200px]">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition-colors w-full">
                <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  title="Sort items" 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer appearance-none flex-1 w-full"
                >
                  <option className="bg-zinc-900 text-white" value="Newest">Newest</option>
                  <option className="bg-zinc-900 text-white" value="Price: Low to High">Price: Low to High</option>
                  <option className="bg-zinc-900 text-white" value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
            <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
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
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
                No products found in this category.
            </div>
        )}
      </section>
      
      <Footer />
    </main>
  );
}
