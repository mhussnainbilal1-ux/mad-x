import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
export const metadata = { title: "Wholesale & Private Label" };
export default function Page() {
  return (
    <main>
      <section className="pageHero wholesaleHero">
        <div className="shell">
          <span className="kicker">OEM • PRIVATE LABEL • WHOLESALE</span>
          <h1>Turn your concept into a sellable product.</h1>
          <p>
            Development, branding, sampling, bulk manufacturing and export
            packing for combat sports brands and distributors.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell wholesaleIntro">
          <div>
            <span className="kicker dark">Custom manufacturing</span>
            <h2>Flexible programs for growing brands</h2>
            <p>
              Start with an existing base design or develop a product from your
              own tech pack, sample or reference. We can adapt materials,
              padding, fit, colors, branding and packaging.
            </p>
            <div className="capabilityGrid">
              <div>
                <b>Branding</b>
                <span>
                  Embroidery, patches, labels, sublimation and printing
                </span>
              </div>
              <div>
                <b>Materials</b>
                <span>
                  Leather, synthetics, cotton weaves and performance knits
                </span>
              </div>
              <div>
                <b>Packaging</b>
                <span>
                  Poly bags, boxes, hangtags, barcodes and carton marks
                </span>
              </div>
              <div>
                <b>Development</b>
                <span>
                  Samples, revisions, size grading and production specs
                </span>
              </div>
            </div>
          </div>
          <div className="quoteCard">
            <span>Typical workflow</span>
            <ol>
              <li>Share product requirements</li>
              <li>Review specifications and quotation</li>
              <li>Develop and approve sample</li>
              <li>Confirm bulk order</li>
              <li>Production and quality checks</li>
              <li>Packing and shipment</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="section cream">
        <div className="shell formLayout">
          <div>
            <span className="kicker dark">Start a conversation</span>
            <h2>Tell us what you want to manufacture</h2>
            <p>
              Include your target quantity, market, product references,
              preferred materials and expected launch date.
            </p>
            <Link className="textLink" href="/faq">
              Read wholesale FAQ →
            </Link>
          </div>
          <InquiryForm compact />
        </div>
      </section>
    </main>
  );
}
