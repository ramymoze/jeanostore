"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Streetwear",
    description: "Urban culture meets high fashion.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1000&auto=format&fit=crop",
    className: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: 2,
    name: "Techwear",
    description: "Functionality for the future.",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop",
    className: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: 3,
    name: "Accessories",
    description: "The finishing touches.",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1000&auto=format&fit=crop",
    className: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: 4,
    name: "Limited Edition",
    description: "Exclusive drops for the elite.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    className: "col-span-1 md:col-span-2 row-span-1",
  },
];

export function FeaturedCategories() {
  return (
    <section id="collections" className="py-24 px-4 md:px-6 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Curated <span className="text-primary">Collections</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Explore our meticulously selected categories, designed to define your unique style.
          </p>
        </motion.div>

        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${category.className}`}
            >
              <div className="absolute inset-0 bg-muted">

                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-white/70 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {category.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary group-hover:rotate-45 transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide h-[400px]">
           {categories.map((category) => (
            <div
              key={category.id}
              className="snap-center shrink-0 w-[300px] relative group overflow-hidden rounded-2xl"
            >
               <div className="absolute inset-0 bg-muted">

                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-white/70 text-sm">
                  {category.description}
                </p>
              </div>
            </div>
           ))}
        </div>
      </div>
    </section>
  );
}
