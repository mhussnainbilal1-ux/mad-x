import Link from "next/link";
import RugbyPosterList from "@/components/RugbyPosterList";

export const metadata = {
  title: "Ice Hockey Catalogue",
  description:
    "Explore the MADX Sports ice hockey catalogue for custom, private-label teamwear and equipment.",
  alternates: { canonical: "/ice-hockey" },
};

export default function IceHockeyPage() {
  return (
    <main>
      <section className="pageHero rugbyHero hockeyHero">
        <div className="shell rugbyHeroContent">
          <span className="kicker">MADX SPORTS • ICE HOCKEY COLLECTION</span>
          <h1>Made for speed. Built for impact.</h1>
          <p>
            Explore our ice hockey catalogue of customizable teamwear and
            equipment, developed for clubs, brands and distributors.
          </p>
          <div className="rugbyHeroActions">
            <a className="button red" href="#ice-hockey-catalogue">
              View catalogue
            </a>
            <Link className="button ghost" href="/quote">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <section className="section rugbyCatalogue" id="ice-hockey-catalogue">
        <div className="shell">
          <div className="rugbyHeading">
            <div>
              <span className="kicker dark">THE COLLECTION</span>
              <h2>Ice hockey catalogue</h2>
            </div>
            <p>
              Select a poster to view it at full size. Every product can be
              developed around your colors, branding and specifications.
            </p>
          </div>

          <RugbyPosterList
            dialogLabel="Ice hockey catalogue poster viewer"
            posters={[
              {
                src: "/images/ice-hockey/1.png",
                alt: "MADX Sports ice hockey catalogue poster 1",
              },
              {
                src: "/images/ice-hockey/2.png",
                alt: "MADX Sports ice hockey catalogue poster 2",
              },
            ]}
          />
        </div>
      </section>

      <section className="section darkPanel rugbyFinal">
        <div className="shell center">
          <span className="kicker">YOUR TEAM. YOUR COLORS. YOUR IDENTITY.</span>
          <h2>Ready to build your ice hockey range?</h2>
          <p>
            Send us your artwork, reference products or product brief and we’ll
            help shape the next step toward sampling and production.
          </p>
          <Link className="button red" href="/quote">
            Start your project
          </Link>
        </div>
      </section>
    </main>
  );
}
