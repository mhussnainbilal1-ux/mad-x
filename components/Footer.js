import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerGrid">
        <div>
          <Link href="/" className="brand footerBrand">
            <span className="brandMark light">IC</span>
            <span>
              <b>IRONCLAD</b>
              <small>FIGHTWEAR</small>
            </span>
          </Link>
          <p>
            OEM and private-label MMA, boxing, BJJ and fitness gear manufactured
            for global brands, clubs and distributors.
          </p>
          <span>Sialkot, Pakistan</span>
        </div>
        <div>
          <h4>Products</h4>
          <Link href="/products">All Products</Link>
          <Link href="/products?category=Boxing">Boxing</Link>
          <Link href="/products?category=MMA">MMA</Link>
          <Link href="/products?category=BJJ">BJJ & No-Gi</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/factory-tour">Factory Tour</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div>
          <h4>Business</h4>
          <Link href="/wholesale">OEM / Private Label</Link>
          <Link href="/quote">Request Quote</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="shell footerBottom">
        <span>© 2026 Ironclad Fightwear</span>
        <span>Built for brands that fight forward.</span>
      </div>
    </footer>
  );
}
