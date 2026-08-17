import Link from "next/link";
import { notFound } from "next/navigation";
import { allProducts, previewProducts } from "@/lib/products";
import { hasCatalogueAccess } from "@/lib/catalogue-access";
import { getProductRange } from "@/lib/common";
import RangeProducts from "../../../components/RangeProducts";
import ImageZoomWrapper from "../../../components/ImageZoomWrapper";
import Image from "next/image";
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hasAccess = await hasCatalogueAccess();
  const products = hasAccess ? allProducts : previewProducts;
  const p = products.find((x) => x.slug === slug);
  return { title: p?.name || "Product" };
}
export default async function Page({ params }) {
  const { slug } = await params;
  const hasAccess = await hasCatalogueAccess();
  const products = hasAccess ? allProducts : previewProducts;
  const p = products.find((x) => x.slug === slug);

  if (!p) notFound();
  return (
    <main>
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

            <RangeProducts range={getProductRange(products, p.index, p.type)} />
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
              {p.features.map((f) => (
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
          </div>
        </div>
      </section>
    </main>
  );
}
