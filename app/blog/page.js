import Link from "next/link";
export const metadata = { title: "Insights" };
const posts = [
  [
    "How to prepare an OEM boxing glove brief",
    "A practical checklist covering materials, padding, closure, sizes and branding.",
  ],
  [
    "Private label vs custom development",
    "Understand when to customize an existing design and when to create a new product.",
  ],
  [
    "What affects combat sports manufacturing MOQ?",
    "A look at material purchasing, artwork setup, packaging and production efficiency.",
  ],
  [
    "How sampling works",
    "Learn what to review before approving a product for bulk production.",
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
          url("/images/factory/banner-insight.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">MANUFACTURING INSIGHTS</span>
          <h1>Useful guidance for combat sports brands.</h1>
          <p>
            Educational content that helps buyers prepare stronger product
            briefs and make better development decisions.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell blogGrid">
          {posts.map((p, i) => (
            <article key={p[0]}>
              <span>ARTICLE 0{i + 1}</span>
              <h2>{p[0]}</h2>
              <p>{p[1]}</p>
              <Link href="/contact">Discuss with our team →</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
