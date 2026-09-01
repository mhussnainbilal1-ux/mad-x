import { allProducts, publicProducts } from "@/lib/products";
import { isPublicCatalogueEnabled } from "@/lib/catalogue-settings";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const publicRoutes = [
  "",
  "/about",
  "/products",
  "/wholesale",
  "/factory-tour",
  "/gallery",
  "/rugby",
  "/ice-hockey",
  "/soccer",
  "/faq",
  "/blog",
  "/quote",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap() {
  const lastModified = new Date();
  const productsForSitemap = (await isPublicCatalogueEnabled())
    ? allProducts
    : publicProducts;
  const pages = publicRoutes?.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
  }));

  const products = productsForSitemap?.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
    images: product.image ? [`${siteUrl}${product.image}`] : undefined,
  }));

  return [...pages, ...products];
}
