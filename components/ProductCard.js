import Link from "next/link";
import {getProductSeries} from "../util/common"
import Image from 'next/image'
export default function ProductCard({ product }) {
  return (
    <article className="productCard">
      <Link href={`/products/${product.slug}`} className="productMedia">
       <img src={product.image} alt={product.name}
         loading="lazy"
         decoding="async"
         />
        <span className="pill">{getProductSeries(product.index)}</span>
      </Link>
      <div className="productBody">
        <span className="productCategory">{product.category}</span>
        <h3>{product.name}</h3>
        
          {/* <h3> {getProductSeries(product.index)}</h3> */}
         

        <div className="productBottom">
          <span
            title={product.type}
            style={{
              display: "inline-block",
              maxWidth: "140px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "default",
              verticalAlign: "bottom",
            }}
          >
            {/* {getProductSeries(product.index)} */}
            {product.type}
          </span>
          <Link href={`/products/${product.slug}`}>View details →</Link>
        </div>
      </div>
    </article>
  );
}
