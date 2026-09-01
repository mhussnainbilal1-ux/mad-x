import Link from "next/link";
import { madxCategories } from "@/data/madxCategories";
import Image from "next/image";

const categoryImages = {
  boxing: "/images/category/cat-boxing.png",

  mma: "/images/category/mma.png",
  "bjj-no-gi": "/images/products/bjj/bjj-gis/product.png",

  fitness: "/images/category/fitness.png",

  apparel: "/images/category/apparal.png",
  yoga: "/images/category/yoga.png",
  "leather-fashion-jackets": "/images/category/leather-jackets.png",
};

const categoryLabels = {
  boxing: "GLOVES • BAGS • PROTECTION",
  mma: "GLOVES • SHORTS • PROTECTION",
  "bjj-no-gi": "GIS • RASH GUARDS • NO-GI",
  fitness: "GLOVES • BELTS • SUPPORT",
  yoga: "MATS • BLOCKS • STRAPS",
  apparel: "ACTIVEWEAR • COMPRESSION",
  "leather-fashion-jackets": "BIKER • BOMBER • VARSITY",
  kids: "KIDS COLLECTION",
  sale: "SPECIAL OFFERS",
  "gift-card": "GIFT CARD",
};

export default function CategorySection() {
  const categories = madxCategories.filter(
    (category) => !["sale", "gift-card"].includes(category.slug),
  );

  return (
    <section className="section" data-activity-section="Product capabilities">
      <div className="shell">
        <div className="heading">
          <div>
            <span className="kicker dark">Product Capabilities</span>

            <h2>Choose what you want to manufacture</h2>
          </div>

          <p>
            Explore customizable product ranges that can be developed around
            your materials, construction, colors, branding and packaging.
          </p>
        </div>

        <div className="categoryGrid">
          {categories?.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.name)}`}
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
                <span>{categoryLabels[category.slug] || "VIEW RANGE"}</span>

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
