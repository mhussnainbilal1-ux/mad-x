import ProductBrowser from "@/components/ProductBrowser";
import { products } from "@/data/products";
export const metadata = { title: "Products" };
export default function Page() {
  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <span className="kicker">OEM PRODUCT CATALOGUE</span>
          <h1>Manufacturing range</h1>
          <p>
            Browse products that can be customized with your branding,
            materials, colors, specifications and packaging.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <ProductBrowser products={products} />
        </div>
      </section>
    </main>
  );
}
