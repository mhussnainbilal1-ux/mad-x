import Link from "next/link";
export default function ProductCard({ product }) {
  return (
    <article className="productCard">
      <Link href={`/products/${product.slug}`} className="productMedia">
        <img src={product.image} alt={product.name} />
        <span className="pill">OEM READY</span>
      </Link>
      <div className="productBody">
        <span className="productCategory">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="productBottom">
          <span>{product.type}</span>
          <Link href={`/products/${product.slug}`}>View details →</Link>
        </div>
      </div>
    </article>
  );
}
