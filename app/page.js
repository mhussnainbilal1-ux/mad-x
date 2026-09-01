import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategorySection from "@/components/CategorySection"
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
import Image from 'next/image'
export const metadata = {
  alternates: { canonical: "/" },
};
export default function Home() {
  return (
    <main>
      <section className="hero" data-activity-section="Hero">
        <HeroSlider />
      </section>
      <section className="stats" data-activity-section="Company statistics">
        <div className="shell statsGrid">
          <div>
            <b>80+</b>
            <span>Customizable products</span>
          </div>
          <div>
            <b>25–35</b>
            <span>Typical production days</span>
          </div>
          <div>
            <b>OEM</b>
            <span>Private-label development</span>
          </div>
          <div>
            <b>Sialkot</b>
            <span>Pakistan manufacturing base</span>
          </div>
        </div>
      </section>
      
    <CategorySection/>

      <FeaturedProducts limit={18} />

      <section className="section" data-activity-section="How production works">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">How production works</span>
              <h2>A clear path from idea to shipment</h2>
            </div>
            <p>
              Each project moves through defined development, approval and
              production stages so you know what happens next.
            </p>
          </div>
          <div className="processGrid">
            <article>
              <span>01 — REQUIREMENTS</span>
              <h3>Share your product brief</h3>
              <p>Send specifications, artwork, a tech pack or a reference sample.</p>
            </article>
            <article>
              <span>02 — REVIEW</span>
              <h3>Confirm materials and construction</h3>
              <p>We review feasibility, branding methods, sizing and packaging needs.</p>
            </article>
            <article>
              <span>03 — SAMPLING</span>
              <h3>Develop and refine the sample</h3>
              <p>A sample is prepared for evaluation, feedback and final approval.</p>
            </article>
            <article>
              <span>04 — PRODUCTION</span>
              <h3>Begin approved bulk production</h3>
              <p>Manufacturing follows the confirmed sample and agreed specifications.</p>
            </article>
            <article>
              <span>05 — INSPECTION</span>
              <h3>Check quality and consistency</h3>
              <p>Products are reviewed for construction, finish, branding and packing.</p>
            </article>
            <article>
              <span>06 — DISPATCH</span>
              <h3>Pack for shipment</h3>
              <p>Approved goods are packed, carton-marked and prepared for dispatch.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" data-activity-section="Why MADX Sports">
        <div className="shell split">
          <div className="largeImage">


            
                    <Image
                      src="/images/common/partner.png"
                      alt={"Combat sports manufacturing"}
                      width={500}
                      height={500}
                
                    />
          </div>
          <div className="copy">
            <span className="kicker dark">Why MADX Sports</span>
            <h2>A manufacturing partner, not just a supplier</h2>
            <p>
              We help brands develop products that match their price point,
              market position and performance standards. Our workflow keeps
              sampling, revisions, production and packing clear from start to
              finish.
            </p>
            <ul className="checkList">
              <li>Custom materials, colors and construction</li>
              <li>Embroidery, sublimation, printing and patches</li>
              <li>Size grading and product development</li>
              <li>Retail packaging, barcodes and carton marking</li>
              <li>Pre-shipment quality inspection</li>
            </ul>
            <Link className="button navy" href="/factory-tour">
              See our process
            </Link>
          </div>
        </div>
      </section>
      <section className="section cream" data-activity-section="Customization options">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Built around your brand</span>
              <h2>Customization beyond a printed logo</h2>
            </div>
            <p>
              Product details can be developed to suit your customers, target
              price and visual identity.
            </p>
          </div>
          <div className="valueGrid">
            <article>
              <span>01</span>
              <h3>Materials & construction</h3>
              <p>Select suitable outer materials, padding, linings, closures and reinforcements.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Colors & artwork</h3>
              <p>Apply custom colorways, prints, sublimation, embroidery, patches and graphics.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Sizing & specifications</h3>
              <p>Develop size ranges and product details around your approved requirements.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Labels & packaging</h3>
              <p>Add branded labels, hangtags, barcodes, retail packaging and carton markings.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="section darkPanel" data-activity-section="Start your next collection">
        <div className="shell center">
          <span className="kicker">START YOUR NEXT COLLECTION</span>
          <h2>Ready to develop your next product range?</h2>
          <p>
            Share your design, reference sample or requirements. We will review
            the specifications, recommend suitable options and prepare a clear
            quotation for sampling and bulk production.
          </p>
          <Link className="button red" href="/quote">
            Start a project
          </Link>
        </div>
      </section>
    </main>
  );
}
