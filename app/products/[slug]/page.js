import Link from "next/link";
import { notFound } from "next/navigation";
import { allProducts, isPublicProduct, publicProducts } from "@/lib/products";
import { hasCatalogueAccess } from "@/lib/catalogue-access";
import { getProductRange } from "@/lib/common";
import RangeProducts from "../../../components/RangeProducts";
import ImageZoomWrapper from "../../../components/ImageZoomWrapper";
import Image from "next/image";
import ProductDetailAddButton from "@/components/ProductDetailAddButton";
import { siteUrl } from "@/lib/seo";
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hasAccess = await hasCatalogueAccess();
  const products = hasAccess ? allProducts : publicProducts;
  const p = products.find((x) => x.slug === slug);
  if (!p) return { title: "Product" };

  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      type: "website",
      title: `${p.name} | MADX Sports`,
      description: p.summary,
      url: `/products/${p.slug}`,
      images: [{ url: p.image, alt: p.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} | MADX Sports`,
      description: p.summary,
      images: [p.image],
    },
  };
}
export default async function Page({ params }) {
  const { slug } = await params;
  const hasAccess = await hasCatalogueAccess();
  const products = hasAccess ? allProducts : publicProducts;
  const p = products.find((x) => x.slug === slug);

  if (!p) notFound();
  const rangeProducts =
    hasAccess || isPublicProduct(p) ? allProducts : products;
  const whatsappMessage = encodeURIComponent(
    `Hi MADX Sports, I would like to request a quote for ${p.name}.`,
  );
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.summary,
    image: p.image,
    category: p.category,
    brand: { "@type": "Brand", name: "MADX Sports" },
    manufacturer: { "@id": `${siteUrl}/#organization` },
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="detailSection">
        <div className="shell detailGrid">
          <div className="detailMedia">
            <ImageZoomWrapper>
              <Image
                src={p.image}
                alt={p.name}
                width={900}
                height={900}
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
                quality={78}
                style={{
                  width: "100%",
                  display: "block",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </ImageZoomWrapper>

            <RangeProducts
              range={getProductRange(rangeProducts, p.index, p.type)}
            />
          </div>
          <div className="detailCopy">
            <Link className="back" href="/products">
              ← Back to products
            </Link>
            <span className="kicker dark">
              {p.category} • OEM / PRIVATE LABEL
            </span>
            <h1>{p.name}</h1>
            <p>{p.summary}</p>
            <div className="specGrid">
              <div>
                <span>Product type</span>
                <b>{p.type}</b>
              </div>
              <div>
                <span>Typical MOQ</span>
                <b>{p.moq}</b>
              </div>
              <div>
                <span>Typical lead time</span>
                <b>{p.lead}</b>
              </div>
              <div>
                <span>Materials</span>
                <b>{p.materials}</b>
              </div>
            </div>
            <h3>Customization options</h3>
            <ul className="featureList">
              {p.features?.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="noticeBox">
              <b>This is a quotation-only website.</b>
              <span>
                Customers cannot place an online order. Product specifications
                and pricing are confirmed through inquiry.
              </span>
            </div>
            <Link className="button red wide" href={`/quote?product=${p.slug}`}>
              Request quote for this product
            </Link>
            <a
              className="button productWhatsAppButton"
              href={`https://wa.me/923044989753?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Request a quote for ${p.name} on WhatsApp`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M16.04 3A12.82 12.82 0 0 0 5.18 22.65L3 29l6.59-2.12A12.89 12.89 0 1 0 16.04 3Zm0 23.58a10.62 10.62 0 0 1-5.42-1.48l-.39-.23-3.91 1.26 1.28-3.8-.25-.4a10.58 10.58 0 1 1 8.69 4.65Zm5.82-7.94c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57a9.55 9.55 0 0 1-1.77-2.2c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.31.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.36-.25-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"
                />
              </svg>
              Request quote on WhatsApp
            </a>
            <ProductDetailAddButton product={p} />
          </div>
        </div>
      </section>
    </main>
  );
}
