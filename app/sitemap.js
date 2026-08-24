import { previewProducts } from "@/lib/products";
import { siteUrl } from "@/lib/seo";

const publicRoutes = [
  "",
  "/about",
  "/products",
  "/wholesale",
  "/factory-tour",
  "/gallery",
  "/faq",
  "/blog",
  "/quote",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap() {
  const lastModified = new Date();
  const pages = publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
  }));

  const products = previewProducts.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
    images: product.image ? [`${siteUrl}${product.image}`] : undefined,
  }));

  return [...pages, ...products];
}
