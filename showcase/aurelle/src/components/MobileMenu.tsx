import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { gsap } from "../lib/gsap";
import { NAV_LINKS, NAV_CTA, BRAND } from "../data/siteContent";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function MobileMenu({ open, onClose, onNavigate }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open) {
      document.body.style.overflow = "hidden";
      const links = linksRef.current.filter(Boolean);
      gsap.set(panel, { display: "flex" });
      gsap
        .timeline()
        .fromTo(panel, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.85, ease: "power4.inOut" })
        .fromTo(links, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.07 }, "-=0.35");
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      gsap.to(panel, {
        clipPath: "circle(0% at 100% 0%)",
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => gsap.set(panel, { display: "none" }),
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div id="mobile-menu" ref={panelRef} className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="mobile-menu__top container">
        <span className="navbar__brand">{BRAND.wordmark}</span>
        <button ref={closeRef} type="button" className="mobile-menu__close" onClick={onClose} aria-label="Close menu">
          Close
        </button>
      </div>

      <nav className="mobile-menu__links container" aria-label="Mobile">
        {NAV_LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            ref={(el) => {
              if (el) linksRef.current[i] = el;
            }}
            onClick={(e) => onNavigate(e, l.href)}
          >
            {l.label}
          </a>
        ))}
        <a
          href={NAV_CTA.href}
          className="mobile-menu__cta"
          ref={(el) => {
            if (el) linksRef.current[NAV_LINKS.length] = el;
          }}
          onClick={(e) => onNavigate(e, NAV_CTA.href)}
        >
          {NAV_CTA.label}
        </a>
      </nav>
    </div>
  );
}
