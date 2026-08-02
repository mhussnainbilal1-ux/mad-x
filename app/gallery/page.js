export const metadata = { title: "Gallery" };
const images = [
  [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1000&q=85",
    "Boxing development",
  ],
  [
    "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1000&q=85",
    "BJJ range",
  ],
  [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85",
    "Performance apparel",
  ],
  [
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1000&q=85",
    "MMA training",
  ],
  [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85",
    "Fitness equipment",
  ],
  [
    "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1000&q=85",
    "Manufacturing process",
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
          url("/images/factory/banner-gallery.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">PRODUCT & FACTORY GALLERY</span>
          <h1>Built, branded and prepared for market.</h1>
          <p>
            Replace these demonstration images with your own factory, products,
            team and packaging photography before launch.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell galleryGrid">
          {images.map((x) => (
            <figure key={x[1]}>
              <img src={x[0]} alt={x[1]} />
              <figcaption>{x[1]}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
