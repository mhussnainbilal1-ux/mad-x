import Link from "next/link";
export const metadata = { title: "About Us" };
export default function Page() {
  return (
    <main>
      <section className="pageHero aboutHero">
        <div className="shell">
          <span className="kicker">ABOUT IRONCLAD</span>
          <h1>Crafted in Sialkot. Built for the world.</h1>
          <p>
            We combine combat sports product knowledge, skilled workmanship and
            structured quality control to support international brands.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell split">
          <div className="copy">
            <span className="kicker dark">Our story</span>
            <h2>From manufacturing heritage to modern brand partnerships</h2>
            <p>
              Ironclad Fightwear is positioned as an OEM and private-label
              manufacturing partner for boxing, MMA, BJJ and fitness companies.
              We focus on transparent communication, repeatable quality and
              product development that fits each customer's market.
            </p>
            <p>
              Our goal is simple: help brands launch dependable products,
              improve existing ranges and scale production without losing
              control of quality or identity.
            </p>
            <Link className="button navy" href="/quote">
              Discuss your project
            </Link>
          </div>
          <div className="largeImage">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85"
              alt="Production team"
            />
          </div>
        </div>
      </section>
      <section className="section cream">
        <div className="shell">
          <div className="heading">
            <div>
              <span className="kicker dark">What guides us</span>
              <h2>Built around long-term partnerships</h2>
            </div>
          </div>
          <div className="valueGrid">
            <article>
              <span>01</span>
              <h3>Product integrity</h3>
              <p>
                Materials, construction and finish must match the approved
                sample.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Clear communication</h3>
              <p>
                Specifications, revisions, timelines and packing requirements
                stay documented.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Brand protection</h3>
              <p>
                Your artwork, samples and custom developments are treated
                confidentially.
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>Continuous improvement</h3>
              <p>
                Feedback from each order is used to strengthen future
                production.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
