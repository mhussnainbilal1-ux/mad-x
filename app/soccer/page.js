import Link from "next/link";
import RugbyPosterList from "@/components/RugbyPosterList";

export const metadata = {
  title: "Soccer Catalogue",
  description:
    "Explore the MADX Sports soccer catalogue for custom, private-label teamwear and equipment.",
  alternates: { canonical: "/soccer" },
};

export default function SoccerPage() {
  return (
    <main>
      <section className="pageHero rugbyHero soccerHero">
        <div className="shell rugbyHeroContent">
          <span className="kicker">MADX SPORTS • SOCCER COLLECTION</span>
          <h1>Made for every moment of the game.</h1>
          <p>
            Explore our soccer catalogue of customizable teamwear and
            equipment, developed for clubs, brands and distributors.
          </p>
          <div className="rugbyHeroActions">
            <a className="button red" href="#soccer-catalogue">
              View catalogue
            </a>
            <Link className="button ghost" href="/quote">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <section className="section rugbyCatalogue" id="soccer-catalogue">
        <div className="shell">
          <div className="rugbyHeading">
            <div>
              <span className="kicker dark">THE COLLECTION</span>
              <h2>Soccer catalogue</h2>
            </div>
            <p>
              Select a poster to view it at full size. Every product can be
              developed around your colors, branding and specifications.
            </p>
          </div>

          <RugbyPosterList
            dialogLabel="Soccer catalogue poster viewer"
            posters={[
              {
                src: "/images/soccer/1.png",
                alt: "MADX Sports soccer catalogue poster 1",
              },
              {
                src: "/images/soccer/2.png",
                alt: "MADX Sports soccer catalogue poster 2",
              },
            ]}
          />
        </div>
      </section>

      <section className="section darkPanel rugbyFinal">
        <div className="shell center">
          <span className="kicker">YOUR TEAM. YOUR COLORS. YOUR IDENTITY.</span>
          <h2>Ready to build your soccer range?</h2>
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
