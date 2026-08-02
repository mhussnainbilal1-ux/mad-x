import ProductBrowser from "@/components/ProductBrowser";
import SubCategorySidebar from "@/components/SubCategorySidebar";
import { products } from "@/data/products";
import { rdxCategories } from "@/data/rdxCategories";

export const metadata = {
  title: "Products",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;

  const selectedCategory =
    params?.category || rdxCategories[0].name;

  const selectedSubCategory =
    params?.subCategory || "";

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      product.category === selectedCategory;

    const matchesSubCategory =
      !selectedSubCategory ||
      product.subCategory === selectedSubCategory;

    return matchesCategory && matchesSubCategory;
  });

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
          url("/images/factory/banner-product.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <span className="kicker">
            OEM PRODUCT CATALOGUE
          </span>

          <h1>Manufacturing range</h1>

          <p>
            Browse products that can be customized with your
            branding, materials, colors, specifications and
            packaging.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="productsCatalogueLayout">
            <SubCategorySidebar
              selectedCategory={selectedCategory}
              selectedSubCategory={
                selectedSubCategory
              }
            />

            <div className="productsCatalogueContent">
              <div className="catalogueTitleRow">
                <div>
                  <span className="kicker dark">
                    {selectedCategory}
                  </span>

                  <h2>
                    {selectedSubCategory ||
                      `All ${selectedCategory} Products`}
                  </h2>
                </div>

                <span className="productResultCount">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <ProductBrowser
                  products={filteredProducts}
                />
              ) : (
                <div className="emptyProducts">
                  <h3>No products added yet</h3>

                  <p>
                    Products for this subcategory will appear
                    here after they are added to
                    <code> products.js</code>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}