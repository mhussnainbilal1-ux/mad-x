import Link from "next/link";

export const metadata = {
  title: "About Us",
  description:
    "Discover 16 years of MADX Sports manufacturing excellence in Sialkot, supporting private-label boxing, MMA, fitness and apparel brands.",
  alternates: { canonical: "/about" },
};

const expertise = [
  {
    number: "01",
    title: "Product development",
    text: "We turn designs, tech packs and reference samples into defined materials, construction details, sizing and branding specifications.",
  },
  {
    number: "02",
    title: "Private-label manufacturing",
    text: "Products are developed around each brand’s identity, target market, approved sample and packaging requirements.",
  },
  {
    number: "03",
    title: "Quality-focused production",
    text: "Materials, workmanship, measurements, branding and packing are reviewed against the confirmed product requirements.",
  },
];

const values = [
  ["01", "Product integrity", "Materials, construction, branding and finish should remain aligned with the approved sample."],
  ["02", "Clear communication", "Specifications, revisions, approvals, timelines and packing requirements stay documented."],
  ["03", "Brand confidentiality", "Artwork, samples and custom product developments are handled with appropriate care."],
  ["04", "Continuous improvement", "Feedback from development and production is used to strengthen future orders."],
];

export default function Page() {
  return (
    <main>
      <section
        className="pageHero aboutHero"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(6, 17, 32, 0.98) 0%,
              rgba(6, 17, 32, 0.75) 35%,
              rgba(6, 17, 32, 0.35) 70%,
              rgba(6, 17, 32, 0) 100%
            ),
            url("/images/factory/banner-about.png") center/cover no-repeat
          `,
          minHeight: "500px",
        }}
      >
        <div className="shell">
          <span className="kicker">ABOUT MADX SPORTS</span>
          <h1>16 years of excellence.</h1>
          <p>
            Built in Sialkot through product knowledge, skilled workmanship and
            long-term partnerships with private-label brands.
          </p>
          <div className="aboutHeroActions">
            <Link className="button red" href="/quote">
              Discuss your project
            </Link>
            <Link className="button ghost" href="/factory-tour">
              Explore our process
            </Link>
          </div>
        </div>
      </section>

      <section className="stats aboutStats">
        <div className="shell statsGrid">
          <div>
            <b>16</b>
            <span>Years of excellence</span>
          </div>
          <div>
            <b>OEM</b>
            <span>Private-label manufacturing</span>
          </div>
          <div>
            <b>Sialkot</b>
            <span>Pakistan manufacturing base</span>
          </div>
          <div>
            <b>End-to-end</b>
            <span>Development to packaging</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split aboutStory">
          <div className="copy">
            <span className="kicker dark">Our story</span>
            <h2>Experience shaped by products, people and partnerships</h2>
            <p>
              For 16 years, MADX Sports has developed its manufacturing
              experience around combat sports, fitness equipment and
              performance apparel. That experience supports the practical
              decisions behind materials, construction, fit, branding and
              packaging.
            </p>
            <p>
              We work as an OEM and private-label manufacturing partner,
              helping brands move from an initial idea or reference sample to
              an approved product and organized bulk production.
            </p>
            <p>
              Our goal is straightforward: protect the approved product
              standard while helping each customer build a range that suits
              their market and brand identity.
            </p>
            <Link className="button navy" href="/factory-tour">
              See how we manufacture
            </Link>
          </div>
          <div className="largeImage aboutImage">
            <img
              src="/images/common/about.png"
              alt="MADX Sports product development and manufacturing process"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="section cream">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">What we bring</span>
              <h2>Manufacturing support beyond the production line</h2>
            </div>
            <p>
              Our role connects product definition, brand customization,
              manufacturing and final preparation for dispatch.
            </p>
          </div>
          <div className="processGrid">
            {expertise.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">What guides us</span>
              <h2>Built around long-term partnerships</h2>
            </div>
            <p>
              Reliable partnerships depend on clear expectations, approved
              standards and consistent communication.
            </p>
          </div>
          <div className="valueGrid">
            {values.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section darkPanel">
        <div className="shell center">
          <span className="kicker">BUILD WITH EXPERIENCE</span>
          <h2>Let’s develop your next product range.</h2>
          <p>
            Share your idea, design, tech pack or reference sample. We will
            review your requirements and outline the next steps for development,
            sampling and production.
          </p>
          <div className="aboutFinalActions">
            <Link className="button red" href="/quote">
              Start a project
            </Link>
            <Link className="button ghost" href="/contact">
              Contact our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
