import Link from "next/link";
import RugbyPosterList from "@/components/RugbyPosterList";

export const metadata = {
  title: "Rugby Catalogue",
  description:
    "Explore the MADX Sports rugby catalogue for custom, private-label teamwear and equipment.",
  alternates: { canonical: "/rugby" },
};

export default function RugbyPage() {
  return (
    <main>
      <section className="pageHero rugbyHero">
        <div className="shell rugbyHeroContent">
          <span className="kicker">MADX SPORTS • RUGBY COLLECTION</span>
          <h1>Built for the full eighty.</h1>
          <p>
            Explore our rugby catalogue of customizable teamwear and equipment,
            developed for clubs, brands and distributors.
          </p>
          <div className="rugbyHeroActions">
            <a className="button red" href="#rugby-catalogue">
              View catalogue
            </a>
            <Link className="button ghost" href="/quote">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <section className="section rugbyCatalogue" id="rugby-catalogue">
        <div className="shell">
          <div className="rugbyHeading">
            <div>
              <span className="kicker dark">THE COLLECTION</span>
              <h2>Rugby catalogue</h2>
            </div>
            <p>
              Select a poster to view it at full size. Every product can be
              developed around your colors, branding and specifications.
            </p>
          </div>

          <RugbyPosterList
            dialogLabel="Rugby catalogue poster viewer"
            posters={[
              {
                src: "/images/rugby/1.png",
                alt: "MADX Sports rugby catalogue poster 1",
              },
              {
                src: "/images/rugby/2.png",
                alt: "MADX Sports rugby catalogue poster 2",
              },
            ]}
          />
        </div>
      </section>

      <section className="section darkPanel rugbyFinal">
        <div className="shell center">
          <span className="kicker">YOUR CLUB. YOUR COLORS. YOUR IDENTITY.</span>
          <h2>Ready to build your rugby range?</h2>
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
