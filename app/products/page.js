import ProductBrowser from "@/components/ProductBrowser";
import CatalogueAccessControls from "@/components/CatalogueAccessControls";
import { allProducts, previewProducts } from "@/lib/products";
import { hasCatalogueAccess } from "@/lib/catalogue-access";
import { madxCategories } from "@/data/madxCategories";
import MobileOnly from "../../components/MobileOnly";
export const metadata = {
  title: "Products",
};

export default async function Page({ searchParams }) {
  const hasAccess = await hasCatalogueAccess();
  const products = hasAccess ? allProducts : previewProducts;
  const params = await searchParams;

  const selectedCategory = params?.category || madxCategories[0].name;

  const selectedSubCategory = params?.subCategory || "";

  let filteredProducts = products.filter((product) => {
    const matchesCategory = product.category?.includes(selectedCategory);

    const matchesSubCategory = !selectedSubCategory
      ? true
      : selectedSubCategory === "Coaching Equipment"
        ? [product.name, product.type, product.subCategory].some((value) =>
            value?.includes("Focus"),
          )
        : product.subCategory?.includes(selectedSubCategory);

    return matchesCategory && matchesSubCategory;
  });

  if (selectedCategory === "Boxing" && !selectedSubCategory) {
    filteredProducts = [...filteredProducts].sort((a, b) => a.index - b.index);
  }

  return (
    <main>
      <section
        className="pageHero"
        style={{
          background: `
        linear-gradient(
          90deg,
          rgba(6, 17, 32, 0.98) 0%,
          rgba(6, 17, 32, 0.75) 35%,
          rgba(6, 17, 32, 0.35) 70%,
          rgba(6, 17, 32, 0) 100%
        ),
          url("/images/factory/banner-product.png") center/cover no-repeat
        `,
          minHeight: "360px",
        }}
      >
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
          <div className="productsCatalogueLayout">
            <MobileOnly
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
            />

            <div className="productsCatalogueContent">
              <div className="catalogueTitleRow">
                <div>
                  <span className="kicker dark">{selectedCategory}</span>

                  <h2>
                    {selectedSubCategory || `All ${selectedCategory} Products`}
                  </h2>
                </div>
              </div>

              <CatalogueAccessControls hasAccess={hasAccess} />

              {filteredProducts.length > 0 ? (
                <ProductBrowser
                  products={filteredProducts}
                  catalogueProducts={products}
                />
              ) : (
                <div className="emptyProducts">
                  <h3>Coming Soon</h3>

                  <p>
                    Interested in this range? Tell us what you need and we can
                    review custom development options for your brand.
                  </p>
                  <a className="button navy" href="/quote">
                    Discuss this product
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
