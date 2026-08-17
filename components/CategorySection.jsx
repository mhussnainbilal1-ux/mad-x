import Link from "next/link";
import { rdxCategories } from "@/data/rdxCategories";
import Image from 'next/image'

const categoryImages = {
  boxing:
    "/images/category/cat-boxing.png",

  mma:
  "/images/category/mma.png",

  fitness:
  "/images/category/fitness.png",

  apparel:
  "/images/category/apparal.png",
  yoga:
  "/images/category/yoga.png",
  collections:
  "/images/category/collection.png",
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
              Product Capabilities
            </span>

            <h2>Choose what you want to manufacture</h2>
          </div>

          <p>
            Explore customizable product ranges that can be developed around
            your materials, construction, colors, branding and packaging.
          </p>
        </div>

        <div className="categoryGrid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.name}`}
              className="categoryCard"
            >
             <Image
                src={categoryImages[category.slug]}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={75}
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
