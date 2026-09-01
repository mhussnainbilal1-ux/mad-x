import ProductBrowser from "@/components/ProductBrowser";
import CatalogueAccessControls from "@/components/CatalogueAccessControls";
import Link from "next/link";
import { allProducts, previewProducts } from "@/lib/products";
import { getCatalogueAccess } from "@/lib/catalogue-access";
import { madxCategories } from "@/data/madxCategories";
import MobileOnly from "../../components/MobileOnly";
export const metadata = {
  title: "Products",
  description:
    "Explore customizable boxing, MMA, fitness and activewear products available for OEM and private-label manufacturing by MADX Sports.",
  alternates: { canonical: "/products" },
};

export default async function Page({ searchParams }) {
  const access = await getCatalogueAccess();
  const hasAccess = access.hasCatalogueAccess;
  const params = await searchParams;
  const requestedCategory =
    params?.category === "Apparel" ? "Activewear" : params?.category;

  const selectedCategory =
    madxCategories.find((category) => category.name === requestedCategory)
      ?.name || madxCategories[0].name;
  const selectedSubCategory = params?.subCategory || "";
  const isApparelCatalogue =
    selectedCategory.trim().toLowerCase() === "activewear";
  const isBjjCatalogue =
    selectedCategory.trim().toLowerCase() === "bjj & no-gi";
  const isPublicCatalogue = isApparelCatalogue || isBjjCatalogue;
  const products =
    hasAccess || isApparelCatalogue
      ? allProducts
      : isBjjCatalogue
        ? allProducts.filter(
            (product) =>
              product.category?.trim().toLowerCase() === "bjj & no-gi",
          )
        : previewProducts;
  const canBrowseSelectedCatalogue = hasAccess || isPublicCatalogue;

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
          url("/images/factory/${isApparelCatalogue ? "banner-apparel.png" : "banner-product.png"}") center/cover no-repeat
        `,
          minHeight: "360px",
        }}
      >
        <div className="shell">
          <span className="kicker">OEM PRODUCT CATALOGUE</span>

          <h1
            style={
              isApparelCatalogue
                ? { fontSize: "clamp(40px, 5vw, 64px)" }
                : undefined
            }
          >
            {isApparelCatalogue ? (
              <>
                Performance apparel,
                <br /> built for your brand
              </>
            ) : (
              "Manufacturing range"
            )}
          </h1>

          <p>
            {isApparelCatalogue ? (
              <>
                Create standout activewear engineered for movement,
                <br /> customized with your designs, colors and signature brand
                identity.
              </>
            ) : (
              "Browse products that can be customized with your branding, materials, colors, specifications and packaging."
            )}
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

              {!isPublicCatalogue && !access.isPublicCatalogue && (
                <CatalogueAccessControls hasAccess={hasAccess} />
              )}

              {filteredProducts.length > 0 ? (
                <ProductBrowser
                  products={filteredProducts}
                  catalogueProducts={products}
                  hasCatalogueAccess={canBrowseSelectedCatalogue}
                />
              ) : (
                <div className="emptyProducts">
                  {canBrowseSelectedCatalogue ? (
                    <>
                      <h3>Coming Soon</h3>

                      <p>
                        Interested in this range? Tell us what you need and we
                        can review custom development options for your brand.
                      </p>
                      <a className="button navy" href="/quote">
                        Discuss this product
                      </a>
                    </>
                  ) : (
                    <>
                      <h3>Catalogue locked</h3>
                      <p>
                        Unlock the catalogue to view all available products and
                        images in this range.
                      </p>
                      <Link
                        className="button navy"
                        href={{
                          pathname: "/products",
                          query: { ...params, unlock: "1" },
                        }}
                      >
                        Unlock Catalogue
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
