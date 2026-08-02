import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="shell heroCopy">
          <span className="kicker">SIALKOT • PAKISTAN • GLOBAL EXPORT</span>
          <h1>
            YOUR BRAND.
            <br />
            OUR FACTORY.
          </h1>
          <p>
            OEM and private-label MMA, boxing, BJJ and fitness products
            engineered, sampled, manufactured and packed for ambitious combat
            sports brands.
          </p>
          <div className="heroActions">
            <Link className="button red" href="/quote">
              Request a Quote
            </Link>
            <Link className="button ghost" href="/products">
              Explore Products
            </Link>
          </div>
        </div>
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
      <section className="section">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Manufacturing capabilities</span>
              <h2>Built for combat sports brands</h2>
            </div>
            <p>
              From first sketches to retail-ready packaging, every stage is
              designed around your specifications, brand identity and target
              market.
            </p>
          </div>
          <div className="categoryGrid">
            <Link className="categoryCard" href="/products?category=Boxing">
              <img
                src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85"
                alt="Boxing gear"
              />
              <div>
                <span>GLOVES • PADS • PROTECTION</span>
                <h3>Boxing</h3>
                <b>View range →</b>
              </div>
            </Link>
            <Link className="categoryCard" href="/products?category=MMA">
              <img
                src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=85"
                alt="MMA gear"
              />
              <div>
                <span>GLOVES • SHORTS • PROTECTION</span>
                <h3>MMA</h3>
                <b>View range →</b>
              </div>
            </Link>
            <Link className="categoryCard" href="/products?category=BJJ">
              <img
                src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=85"
                alt="BJJ gear"
              />
              <div>
                <span>GIS • RASH GUARDS • BELTS</span>
                <h3>BJJ & No-Gi</h3>
                <b>View range →</b>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <section className="section cream">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Popular development programs</span>
              <h2>Products ready for your label</h2>
            </div>
            <Link className="textLink" href="/products">
              View complete range →
            </Link>
          </div>
          <div className="productGrid">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell split">
          <div className="largeImage">
            <img
              src="https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1400&q=85"
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
