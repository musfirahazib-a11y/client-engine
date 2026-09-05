import { useEffect } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { useReducedMotion } from "./lib/useReducedMotion";
import { useLenis } from "./lib/useLenis";

import { Navbar } from "./components/Navbar";
import { CinematicHero } from "./components/CinematicHero";
import { ScrollScene } from "./components/ScrollScene";
import { StorySection } from "./components/StorySection";
import { OriginSection } from "./components/OriginSection";
import { FlavorProfile } from "./components/FlavorProfile";
import { ProductCollection } from "./components/ProductCollection";
import { VisualBreak } from "./components/VisualBreak";
import { BrandStory } from "./components/BrandStory";
import { ShopCTA } from "./components/ShopCTA";
import { ShowcaseCTA } from "./components/ShowcaseCTA";
import { Footer } from "./components/Footer";

export default function App() {
  const reducedMotion = useReducedMotion();
  useLenis(reducedMotion);

  // Fonts swap in async (Fraunces/Archivo) and can reflow headlines after
  // ScrollTrigger has already measured the page — refresh once they're ready.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if ("fonts" in document) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <Navbar />
      <main id="main">
        <CinematicHero />
        <ScrollScene />
        <StorySection />
        <OriginSection />
        <FlavorProfile />
        <ProductCollection />
        <VisualBreak />
        <BrandStory />
        <ShopCTA />
        <ShowcaseCTA />
      </main>
      <Footer />
    </>
  );
}
