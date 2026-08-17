import Link from "next/link";
import Image from 'next/image'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerGrid">
        <div>
          <Link href="/" className="brand footerBrand">
          <Image
              src="/images/common/logo2.png"
              alt="MADX Sports"
              width={200}
              height={80}
              sizes="200px"
              style={{
                width: "200px",
                height: "auto",
                marginLeft: "-32px"
              }}
          />
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
        <span>© 2026 MADX Sports</span>
        <span>Built for brands that fight forward.</span>
      </div>
    </footer>
  );
}
