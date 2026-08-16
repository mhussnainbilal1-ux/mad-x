import Link from "next/link";
import GalleryShowcase from "@/components/GalleryShowcase";

export const metadata = {
  title: "Gallery",
  description:
    "Explore MADX Sports product development, boxing, MMA, fitness, apparel, quality-control and packaging capabilities.",
};

export default function Page() {
  return (
    <main>
      <section
        className="pageHero galleryHero"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(6, 17, 32, 0.98) 0%,
              rgba(6, 17, 32, 0.76) 38%,
              rgba(6, 17, 32, 0.22) 100%
            ),
            url("/images/factory/banner-gallery.png") center/cover no-repeat
          `,
        }}
      >
        <div className="shell">
          <span className="kicker">PRODUCT &amp; MANUFACTURING GALLERY</span>
          <h1>Developed with purpose. Built for your brand.</h1>
          <p>
            Explore product categories and the development, inspection and
            packing work behind private-label manufacturing.
          </p>
          <div className="galleryHeroActions">
            <a className="button red" href="#gallery-showcase">
              Explore gallery
            </a>
            <Link className="button ghost" href="/quote">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <GalleryShowcase />

      <section className="section darkPanel">
        <div className="shell center">
          <span className="kicker">CUSTOM PRODUCT DEVELOPMENT</span>
          <h2>Want to build a collection around your brand?</h2>
          <p>
            Share your product idea, reference sample or tech pack. We will
            review the requirements and outline the next steps for sampling and
            production.
          </p>
          <div className="galleryFinalActions">
            <Link className="button red" href="/quote">
              Start your project
            </Link>
            <Link className="button ghost" href="/products">
              Explore products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
