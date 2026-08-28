import Link from "next/link";
import GalleryVideos from "@/components/GalleryVideos";

export const metadata = {
  title: "Factory Tour",
  description:
    "Explore the MADX Sports OEM manufacturing process in Sialkot, from product development and sampling to quality inspection and export-ready packaging.",
  alternates: { canonical: "/factory-tour" },
};

const steps = [
  {
    number: "01",
    title: "Product brief and development",
    text: "We review your design, reference sample or tech pack and define construction, materials, measurements, branding and packaging requirements.",
  },
  {
    number: "02",
    title: "Material preparation",
    text: "Approved fabrics, leather alternatives, foam, linings, trims and accessories are checked and prepared for the product specification.",
  },
  {
    number: "03",
    title: "Cutting and branding",
    text: "Product panels are cut and prepared for printing, sublimation, embroidery, patches or other approved branding methods.",
  },
  {
    number: "04",
    title: "Stitching and assembly",
    text: "Components are stitched, shaped and assembled according to the approved sample and category-specific construction requirements.",
  },
  {
    number: "05",
    title: "Quality inspection",
    text: "Construction, measurements, finish, branding, pairing and packaging are checked against the approved requirements.",
  },
  {
    number: "06",
    title: "Packing and dispatch",
    text: "Finished products are labeled, individually packed, carton-marked and prepared for the agreed courier or freight handover.",
  },
];

const capabilities = [
  [
    "01",
    "Product development",
    "Construction planning, material selection, measurements and sample refinement.",
  ],
  [
    "02",
    "Cutting and preparation",
    "Panel cutting and component preparation for equipment and apparel.",
  ],
  [
    "03",
    "Custom branding",
    "Printing, sublimation, embroidery, patches, labels and artwork placement.",
  ],
  [
    "04",
    "Assembly and finishing",
    "Stitching, padding, shaping, reinforcement and final product finishing.",
  ],
  [
    "05",
    "Quality inspection",
    "Checks against approved specifications before products are packed.",
  ],
  [
    "06",
    "Retail-ready packing",
    "Custom packaging, hangtags, barcodes, labels and carton markings.",
  ],
];

const qualityChecks = [
  "Materials and components checked before production",
  "Measurements compared with approved specifications",
  "Stitching, seams and reinforcement points reviewed",
  "Padding shape, placement and pair consistency checked",
  "Colors, artwork, logos and labels verified",
  "Packaging details and carton quantities confirmed",
];

const packagingItems = [
  [
    "Individual packing",
    "Product-specific polybags, boxes or other approved retail packing.",
  ],
  [
    "Brand presentation",
    "Hangtags, woven labels, care labels, size labels and branded inserts.",
  ],
  [
    "Retail information",
    "Barcode placement, product stickers and requested package markings.",
  ],
  [
    "Shipment preparation",
    "Carton quantities, carton marks and packing-list coordination.",
  ],
];

export default function Page() {
  return (
    <main>
      <section
        className="pageHero factoryHero"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(6, 17, 32, 0.98) 0%,
              rgba(6, 17, 32, 0.75) 38%,
              rgba(6, 17, 32, 0.25) 100%
            ),
            url("/images/factory/banner-factory.png") center/cover no-repeat
          `,
        }}
      >
        <div className="shell">
          <span className="kicker">OEM MANUFACTURING • SIALKOT, PAKISTAN</span>
          <h1>Manufacturing built around your product.</h1>
          <p>
            See how MADX Sports develops, manufactures, inspects and prepares
            private-label combat sports, fitness and apparel products.
          </p>
          <div className="factoryHeroActions">
            <Link className="button red" href="/quote">
              Start a product
            </Link>
            <a className="button ghost" href="#factory-process">
              Explore our process
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split factoryIntro">
          <div className="copy">
            <span className="kicker dark">Inside MADX Sports</span>
            <h2>From requirements to production</h2>
            <p>
              Our work begins with your market, product goals and brand
              identity. We translate those requirements into materials,
              construction details, sizing, branding placements and packaging
              instructions that can be followed through sampling and bulk
              production.
            </p>
            <p>
              Whether you provide a design, tech pack or physical reference, the
              approved sample becomes the standard for the production run.
            </p>
            <div className="noticeBox">
              <b>Built for private-label development</b>
              <span>
                Boxing, MMA, fitness equipment and performance apparel can be
                customized around your approved requirements.
              </span>
            </div>
          </div>
          <div className="factoryImageFrame">
            <img
              src="/images/factory/MAD-X-Factory.png"
              alt="Combat sports equipment production floor"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <GalleryVideos />

      <section className="section cream" id="factory-process">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Production workflow</span>
              <h2>A clear path from brief to dispatch</h2>
            </div>
            <p>
              Defined approval and production stages help keep product details,
              branding and packing requirements aligned.
            </p>
          </div>
          <div className="processGrid">
            {steps?.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Factory capabilities</span>
              <h2>Support across the manufacturing cycle</h2>
            </div>
            <p>
              The exact workflow is adapted to the construction and branding
              requirements of each product category.
            </p>
          </div>
          <div className="factoryCapabilityGrid">
            {capabilities?.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cream">
        <div className="shell split">
          <div className="copy">
            <span className="kicker dark">Quality control</span>
            <h2>The approved sample guides bulk production</h2>
            <p>
              Bulk manufacturing follows the confirmed sample, specifications
              and branding details. Checks are carried out throughout the
              workflow and again before packing.
            </p>
            <ul className="checkList">
              {qualityChecks?.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>
          <div className="factoryApprovalCard">
            <span>THE APPROVAL STANDARD</span>
            <h3>Sample first. Production second.</h3>
            <p>
              Materials, dimensions, construction, colors, logo placement,
              labels and packaging should be confirmed before bulk production
              begins.
            </p>
            <Link className="button navy" href="/quote">
              Plan your first sample
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">Packaging and dispatch</span>
              <h2>Prepared for your next destination</h2>
            </div>
            <p>
              Packing details can be coordinated around your brand, distribution
              requirements and approved order specification.
            </p>
          </div>
          <div className="valueGrid">
            {packagingItems?.map(([title, text], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section darkPanel">
        <div className="shell center">
          <span className="kicker">START WITH A SAMPLE</span>
          <h2>Ready to develop your first product?</h2>
          <p>
            Share your design, tech pack, reference sample or requirements. We
            will review the project and outline the next steps for sampling and
            production.
          </p>
          <div className="factoryFinalActions">
            <Link className="button red" href="/quote">
              Request a sample
            </Link>
            <Link className="button ghost" href="/contact">
              Contact manufacturing team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
