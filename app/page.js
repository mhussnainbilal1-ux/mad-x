import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategorySection from "@/components/CategorySection"
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
export default function Home() {
  return (
    <main>
      <section className="hero">
        <HeroSlider />
      </section>
      <section className="stats">
        <div className="shell statsGrid">
          <div>
            <b>10+</b>
            <span>Product categories</span>
          </div>
          <div>
            <b>4–7</b>
            <span>Typical production weeks</span>
          </div>
          <div>
            <b>100%</b>
            <span>Private-label capable</span>
          </div>
          <div>
            <b>Global</b>
            <span>Export support</span>
          </div>
        </div>
      </section>
      
    <CategorySection/>

      <section className="section cream">
        <FeaturedProducts limit={18} />
      </section>
      <section className="section">
        <div className="shell split">
          <div className="largeImage">
            <img
            style={{height:"100%", widht:"auto"}}
              src="/images/common/partner.png"
              alt="Combat sports manufacturing"
            />
          </div>
          <div className="copy">
            <span className="kicker dark">Why Ironclad</span>
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
      <section className="section darkPanel">
        <div className="shell center">
          <span className="kicker">START YOUR NEXT COLLECTION</span>
          <h2>Send your idea, reference sample or tech pack.</h2>
          <p>
            We will review feasibility, recommend materials and prepare a
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
