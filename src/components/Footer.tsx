import { Link } from "react-router-dom";
import { Logo } from "./Logo";

// WhatsApp deep link: wa.me wants digits only (country code, no "+", no
// spaces) — https://faq.whatsapp.com/5913398998672934. Kept as one constant
// so the display format below and the link itself can never drift apart.
const WHATSAPP_NUMBER = "905011041590";
const PHONE_DISPLAY = "+90 501 104 1590";
const ADDRESS_LINES = ["Kötekli Mahallesi, Sıtkı Koçman Caddesi No:15", "Menteşe / Muğla, Türkiye"];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Logo size={32} withWordmark />
          <p>Kenyan groceries, spices and more — brought to Kenyans across Türkiye.</p>
        </div>

        <div className="site-footer-col">
          <h3>Shop</h3>
          <nav className="site-footer-links">
            <Link to="/shop">Browse products</Link>
            <Link to="/signup">Create an account</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>

        <div className="site-footer-col">
          <h3>Get in touch</h3>
          <a
            className="site-footer-whatsapp"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.24 0 4.34.87 5.92 2.46a8.23 8.23 0 0 1 2.43 5.87c0 4.57-3.72 8.28-8.32 8.28a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.27-4.4c0-4.58 3.72-8.32 8.26-8.32M8.5 6.8c-.16 0-.43.06-.66.31s-.87.86-.87 2.08.9 2.41 1.02 2.58c.13.16 1.76 2.79 4.35 3.8 2.15.85 2.59.68 3.06.64.47-.04 1.5-.61 1.71-1.2.21-.59.21-1.09.15-1.2-.06-.1-.23-.16-.48-.29-.25-.12-1.5-.74-1.73-.82-.23-.08-.4-.12-.57.13-.17.24-.65.82-.8.99-.15.16-.29.18-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.15-.24-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.24-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.39-.79-1.9-.2-.48-.41-.42-.57-.42Z" />
            </svg>
            <span>{PHONE_DISPLAY}</span>
          </a>
          <address className="site-footer-address">
            {ADDRESS_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>&copy; {new Date().getFullYear()} Zuri Express. All rights reserved.</p>
      </div>
    </footer>
  );
}
