import Link from "next/link";
import Image from 'next/image'
export const metadata = { title: "Factory Tour" };
const steps = [
  [
    "01",
    "Product development",
    "Requirements are translated into construction details, materials, measurements and branding placements.",
  ],
  [
    "02",
    "Material preparation",
    "Approved fabrics, leather, foam, trims and accessories are inspected and prepared.",
  ],
  [
    "03",
    "Cutting and printing",
    "Panels are cut, printed, sublimated, embroidered or patched according to the specification.",
  ],
  [
    "04",
    "Assembly",
    "Skilled teams stitch, mold and assemble products using category-specific processes.",
  ],
  [
    "05",
    "Quality control",
    "Measurements, workmanship, branding, finishing and packing are checked against the approved sample.",
  ],
  [
    "06",
    "Packing and export",
    "Products are packed, labeled, carton-marked and prepared for freight or courier shipment.",
  ],
];
export default function Page() {
  return (
    <main>
      <section className="pageHero"
      style={{
        background: `
        linear-gradient(
          90deg,
          rgba(6, 17, 32, 0.98) 0%,
          rgba(6, 17, 32, 0.75) 35%,
          rgba(6, 17, 32, 0.35) 70%,
          rgba(6, 17, 32, 0) 100%
        ),
          url("/images/factory/banner-factory.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">FACTORY PROCESS</span>
          <h1>From approved sample to shipment.</h1>
          <p>
            A structured production workflow keeps quality, branding and
            delivery requirements aligned.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="processGrid">
            {steps.map((s) => (
              <article key={s[0]}>
                <span>{s[0]}</span>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section cream">
        <div className="shell split">
          <div className="largeImage">
           <img
              src="/images/factory/MAD-X-Factory.png"
              alt="Factory production"
              style={{width:"800px", height:"100%"}}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="copy">
            <span className="kicker dark">Quality control</span>
            <h2>Approved standards carried into bulk production</h2>
            <p>
              Bulk manufacturing is assessed against the approved sample and
              documented product requirements. Checks can include dimensions,
              stitching, padding, print placement, labels, color, packaging and
              carton quantities.
            </p>
            <Link className="button navy" href="/quote">
              Plan your first sample
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
