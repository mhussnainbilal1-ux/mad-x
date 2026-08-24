export const metadata = {
  title: "Private-Label Manufacturing FAQ",
  description:
    "Answers about MADX Sports minimum order quantities, custom designs, samples, branding, production lead times and international shipping.",
  alternates: { canonical: "/faq" },
};
const faqs = [
  [
    "What is your minimum order quantity?",
    "MOQ depends on product type, materials, branding method and packaging. Typical programs start from 50 apparel pieces or 100 pairs of gloves and protective items.",
  ],
  [
    "Can you manufacture from our design?",
    "Yes. We can work from tech packs, drawings, reference products, measurements or an existing sample.",
  ],
  [
    "Do you provide samples?",
    "Yes. Sampling is normally completed before bulk production so materials, sizing, construction and branding can be approved.",
  ],
  [
    "Can you add our logo and packaging?",
    "Yes. Options include embroidery, woven labels, patches, sublimation, screen printing, heat transfer, hangtags, boxes and barcode labels.",
  ],
  [
    "How long does production take?",
    "Typical bulk lead time is approximately 4–7 weeks after sample approval and order confirmation, depending on complexity and quantity.",
  ],
  [
    "Do you ship internationally?",
    "Yes. Orders can be prepared for courier, air freight, sea freight or delivery to a nominated freight forwarder.",
  ],
  [
    "Can you copy another brand’s product?",
    "We can use reference products to understand construction and quality expectations, but customers should own or have permission to use all branding and protected design elements.",
  ],
];
export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
          url("/images/factory/banner-faq.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">FREQUENTLY ASKED QUESTIONS</span>
          <h1>Before you begin.</h1>
          <p>
            Common questions about private-label development, sampling,
            production and export.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell faqList">
          {faqs.map((f) => (
            <details key={f[0]}>
              <summary>{f[0]}</summary>
              <p>{f[1]}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
