import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product, eventId }) {
  const navigate = useNavigate();

  const primaryImage =
    product.variants?.[0]?.images?.find((img) => img.is_primary)?.image_url ||
    product.variants?.[0]?.images?.[0]?.image_url ||
    null;

  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => parseFloat(v.price)))
    : null;

  const discount = parseFloat(product.base_discount || 0);
  const discountedPrice =
    lowestPrice && discount
      ? (lowestPrice * (1 - discount / 100)).toFixed(2)
      : null;

  const handleClick = () => {
    const path = `/products/${product.id}`;
    navigate(eventId ? `${path}?eventId=${eventId}` : path);
  };

  return (
    <div className="pcard" onClick={handleClick}>
      <div className="pcard-img-wrap">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="pcard-img" />
        ) : (
          <div className="pcard-img-placeholder">
            <span>No Image</span>
          </div>
        )}
        {discount > 0 && <span className="pcard-badge">{discount}% OFF</span>}
      </div>
      <div className="pcard-body">
        <p className="pcard-category">{product.subcategory?.category?.name}</p>
        <h3 className="pcard-name">{product.name}</h3>
        <div className="pcard-pricing">
          {discountedPrice ? (
            <>
              <span className="pcard-price">₹{discountedPrice}</span>
              <span className="pcard-original">₹{lowestPrice?.toFixed(2)}</span>
            </>
          ) : (
            <span className="pcard-price">
              {lowestPrice ? `₹${lowestPrice.toFixed(2)}` : "Price N/A"}
            </span>
          )}
        </div>
        <div className="pcard-meta">
          <span className="pcard-variants">
            {product.variants?.length || 0} variant
            {product.variants?.length !== 1 ? "s" : ""}
          </span>
          {product.variants?.some((v) => v.stock > 0) ? (
            <span className="pcard-instock">In Stock</span>
          ) : (
            <span className="pcard-outstock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
