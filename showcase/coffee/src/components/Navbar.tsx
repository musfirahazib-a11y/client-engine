import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { gsap } from "../lib/gsap";
import { scrollToHash } from "../lib/useLenis";
import { BRAND, NAV_LINKS, NAV_CTA, SHOWCASE } from "../data/siteContent";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cinematic entrance: the nav drops in slightly after the hero starts revealing.
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { yPercent: -100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.9 },
    );
  }, []);

  function handleNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setMenuOpen(false);
    scrollToHash(href);
  }

  return (
    <>
      <header ref={navRef} className={`navbar ${scrolled ? "navbar--solid" : ""}`}>
        <div className="navbar__inner container">
          <a href="#top" className="navbar__brand" onClick={(e) => handleNavClick(e, "#top")}>
            {BRAND.wordmark}
          </a>

          <nav className="navbar__links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="navbar__actions">
            <span className="navbar__badge" title={SHOWCASE.label}>
              {SHOWCASE.label}
            </span>
            <a
              href={NAV_CTA.href}
              className="btn btn--outline-dark navbar__cta"
              onClick={(e) => handleNavClick(e, NAV_CTA.href)}
            >
              {NAV_CTA.label}
            </a>
            <button
              type="button"
              className="navbar__toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`navbar__toggle-bars ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavClick} />
    </>
  );
}
