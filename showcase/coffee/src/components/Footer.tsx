import { useState } from "react";
import type { FormEvent } from "react";
import { FOOTER, BRAND } from "../data/siteContent";
import { RevealText } from "./RevealText";

export function Footer() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <footer className="footer on-dark">
      <div className="container">
        <RevealText as="h2" className="footer__statement" lines={FOOTER.statementLines} />

        <div className="footer__grid">
          <div className="footer__brand-col">
            <span className="navbar__brand">{BRAND.wordmark}</span>
            <p className="footer__tagline">{BRAND.tagline}</p>
            <ul className="footer__social">
              {FOOTER.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER.columns.map((col) => (
            <div className="footer__col" key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__newsletter">
            <h3>{FOOTER.newsletter.title}</h3>
            <p>{FOOTER.newsletter.body}</p>
            {submitted ? (
              <p className="footer__newsletter-ok" role="status">Thank you — you're on the list.</p>
            ) : (
              <form className="footer__form" onSubmit={handleSubmit}>
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <input id="footer-email" type="email" required placeholder="you@example.com" />
                <button type="submit" className="btn btn--outline-light">{FOOTER.newsletter.cta}</button>
              </form>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Amble. Concept brand.</span>
          <span>{FOOTER.legal}</span>
        </div>
      </div>
    </footer>
  );
}
