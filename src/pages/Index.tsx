import React from "react";
import { Header, Hero, Footer } from "@/components/layout";
import { FeaturedProducts } from "@/features/products";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <Header />
      <main className="flex-grow relative z-10">
        <Hero />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
