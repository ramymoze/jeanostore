import { HeroSection } from "@/components/hero-section";
import { ProductsSection } from "@/components/products-section";
import { FeaturedCategories } from "@/components/featured-categories";
import { SocialBanner } from "@/components/social-banner";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <ProductsSection />
      <FeaturedCategories />
      <SocialBanner />
      <Footer />
    </main>
  );
}
