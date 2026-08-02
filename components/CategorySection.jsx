import Link from "next/link";
import { rdxCategories } from "@/data/rdxCategories";

const categoryImages = {
  boxing:
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=85",

  mma:
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=85",

  fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",

  yoga:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85",

  apparel:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",

  collections:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",

  kids:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",

  sale:
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=85",

  "gift-card":
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85",
};

const categoryLabels = {
  boxing: "GLOVES • BAGS • PROTECTION",
  mma: "GLOVES • SHORTS • PROTECTION",
  fitness: "GLOVES • BELTS • SUPPORT",
  yoga: "MATS • BLOCKS • STRAPS",
  apparel: "ACTIVEWEAR • COMPRESSION",
  collections: "RANGES • SERIES",
  kids: "KIDS COLLECTION",
  sale: "SPECIAL OFFERS",
  "gift-card": "GIFT CARD",
};

export default function CategorySection() {
  const categories = rdxCategories.filter(
    (category) =>
      !["sale", "gift-card"].includes(category.slug)
  );

  return (
    <section className="section">
      <div className="shell">
        <div className="heading">
          <div>
            <span className="kicker dark">
              Manufacturing Capabilities
            </span>

            <h2>Built for combat sports brands</h2>
          </div>

          <p>
            From first sketches to retail-ready packaging,
            every stage is designed around your specifications,
            brand identity and target market.
          </p>
        </div>

        <div className="categoryGrid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.name}`}
              className="categoryCard"
            >
              <img
                src={categoryImages[category.slug]}
                alt={category.name}
              />

              <div>
                <span>
                  {categoryLabels[category.slug] ||
                    "VIEW RANGE"}
                </span>

                <h3>{category.name}</h3>

                <b>View range →</b>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}