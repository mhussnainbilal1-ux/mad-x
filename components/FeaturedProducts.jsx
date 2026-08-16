import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "../lib/products";

export default function FeaturedProducts({
  title = "Products we can manufacture for your brand",
  subtitle = "Private-label product range",
  limit = 18,
  background = "cream",
}) {

    const randomProducts = [...products]
  .sort(() => Math.random() - 0.5)
  .slice(0, limit);

  return (
    <section className={`section ${background}`}>
      <div className="shell">
        <div className="heading">
          <div>
            <span className="kicker dark">{subtitle}</span>
            <h2>{title}</h2>
          </div>

          <Link className="textLink" href="/products">
            View complete range →
          </Link>
        </div>

        <div className="productGrid">
          {randomProducts.slice(0, limit).map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
