import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "Ice Hockey Catalogue",
  description:
    "Explore the MADX Sports ice hockey catalogue for custom, private-label teamwear and equipment.",
  alternates: { canonical: "/ice-hockey" },
};

const posterDirectory = path.join(
  process.cwd(),
  "public",
  "images",
  "ice-hockey",
);
const posterExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

function getPosters() {
  if (!fs.existsSync(posterDirectory)) return [];

  return fs
    .readdirSync(posterDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && posterExtensions.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => {
      const extension = path.extname(entry.name);
      const title = path
        .basename(entry.name, extension)
        .replace(/^\d+[-_ ]*/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

      return {
        src: `/images/ice-hockey/${encodeURIComponent(entry.name)}`,
        title: title || "Ice hockey catalogue poster",
        fileName: entry.name,
      };
    })
    .sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
}

export default function IceHockeyPage() {
  const posters = getPosters();

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

          {posters.length > 0 ? (
            <div className="rugbyPosterGrid">
              {posters.map((poster, index) => (
                <a
                  className="rugbyPosterCard"
                  href={poster.src}
                  target="_blank"
                  rel="noreferrer"
                  key={poster.src}
                  aria-label={`Open ${poster.title} poster`}
                >
                  <div className="rugbyPosterImage">
                    <img
                      src={poster.src}
                      alt={poster.title}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span>View full poster ↗</span>
                  </div>
                  <div className="rugbyPosterMeta">
                    <small>
                      ICE HOCKEY • {String(index + 1).padStart(2, "0")}
                    </small>
                    <h3>{poster.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rugbyEmptyState hockeyEmptyState">
              <span className="rugbyEmptyNumber">60</span>
              <div>
                <h3>Catalogue posters coming soon.</h3>
                <p>
                  Our ice hockey collection is being prepared. Contact us now
                  to discuss custom teamwear or private-label production.
                </p>
                <Link className="button navy" href="/contact">
                  Contact our team
                </Link>
              </div>
            </div>
          )}
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
