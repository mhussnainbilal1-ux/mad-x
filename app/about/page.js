import Link from "next/link";
export const metadata = { title: "About Us" };
import Image from 'next/image'
export default function Page() {
  return (
    <main>
      <section className="pageHero aboutHero"
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
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">ABOUT MADX SPORTS</span>
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
             MADX Sports is positioned as an OEM and private-label
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
            style={{width:"100%", height:"auto"}}
              src="/images/common/about.png"
              alt="Production team"
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
