import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch, isLoggedIn } from "./api";
import "./ProductView.css";

function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Variant selection
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cart / buy
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState({ text: "", type: "" });
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Auto-select first available variant when product loads
  useEffect(() => {
    if (!product?.variants?.length) return;
    const firstVariant = product.variants[0];
    setSelectedColor(firstVariant.color);
    setSelectedSize(firstVariant.size);
    setSelectedVariant(firstVariant);
  }, [product]);

  // Update selected variant when color/size changes
  useEffect(() => {
    if (!product || !selectedColor || !selectedSize) return;
    const match = product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    setSelectedVariant(match || null);
    setSelectedImageIndex(0);
  }, [selectedColor, selectedSize, product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data);
        setReviews(data.reviews || []);
      } else {
        setError("Product not found.");
      }
    } catch {
      setError("Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      setCartMsg({ text: "Please log in to add items to cart.", type: "error" });
      return;
    }
    if (!selectedVariant) {
      setCartMsg({ text: "Please select a color and size.", type: "error" });
      return;
    }
    if (selectedVariant.stock < 1) {
      setCartMsg({ text: "This variant is out of stock.", type: "error" });
      return;
    }
    setAddingToCart(true);
    try {
      const res = await authFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ variant_id: selectedVariant.id, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartMsg({ text: "Added to cart!", type: "success" });
      } else {
        setCartMsg({ text: data.error || "Failed to add to cart.", type: "error" });
      }
    } catch {
      setCartMsg({ text: "Server error. Try again.", type: "error" });
    } finally {
      setAddingToCart(false);
      setTimeout(() => setCartMsg({ text: "", type: "" }), 3000);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) { setReviewMsg("Please log in to leave a review."); return; }
    if (!myRating) { setReviewMsg("Please select a rating."); return; }
    try {
      const res = await authFetch(`/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => [data, ...prev]);
        setMyRating(0);
        setMyComment("");
        setReviewMsg("Review submitted!");
      } else {
        setReviewMsg(data.error || "Failed to submit review.");
      }
    } catch {
      setReviewMsg("Server error.");
    }
    setTimeout(() => setReviewMsg(""), 3000);
  };

  // Helper: all unique colors from variants
  const colors = product ? [...new Set(product.variants.map(v => v.color))] : [];

  // Helper: sizes available for selected color
  const sizesForColor = product && selectedColor
    ? product.variants.filter(v => v.color === selectedColor).map(v => v.size)
    : [];

  // Check if a size is in stock for selected color
  const isSizeInStock = (size) => {
    const v = product?.variants.find(v => v.color === selectedColor && v.size === size);
    return v ? v.stock > 0 : false;
  };

  // Current displayed images
  const currentImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product?.variants?.[0]?.images || [];

  // Price calculation
  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : null;
  const discount = parseFloat(product?.base_discount || 0);
  const finalPrice = basePrice && discount
    ? (basePrice * (1 - discount / 100)).toFixed(2)
    : basePrice?.toFixed(2);

  // Average rating
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="pv-loading">
      <div className="pv-spinner"></div>
      <p>Loading product...</p>
    </div>
  );

  if (error) return (
    <div className="pv-error-page">
      <p>{error}</p>
      <button onClick={() => navigate("/products")}>Back to Products</button>
    </div>
  );

  return (
    <div className="pv-root">
      {/* Nav strip */}
      <div className="pv-nav">
        <button onClick={() => navigate(-1)} className="pv-back">← Back</button>
        <span className="pv-breadcrumb">
          {product.subcategory?.category?.name} &rsaquo; {product.subcategory?.name} &rsaquo; {product.name}
        </span>
      </div>

      <div className="pv-container">
        {/* LEFT — Images */}
        <div className="pv-gallery">
          <div className="pv-main-image">
            {currentImages[selectedImageIndex]
              ? <img src={currentImages[selectedImageIndex].image_url} alt={product.name} />
              : <div className="pv-no-image">No Image</div>
            }
            {discount > 0 && <span className="pv-discount-badge">{discount}% OFF</span>}
          </div>
          {currentImages.length > 1 && (
            <div className="pv-thumbnails">
              {currentImages.map((img, i) => (
                <div
                  key={img.id}
                  className={`pv-thumb ${i === selectedImageIndex ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={img.image_url} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div className="pv-details">
          <p className="pv-category">{product.subcategory?.category?.name} / {product.subcategory?.name}</p>
          <h1 className="pv-name">{product.name}</h1>

          {/* Rating summary */}
          {avgRating && (
            <div className="pv-rating-row">
              <div className="pv-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(avgRating) ? "star filled" : "star"}>★</span>
                ))}
              </div>
              <span className="pv-rating-val">{avgRating}</span>
              <span className="pv-rating-count">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}

          {/* Price */}
          <div className="pv-price-block">
            {basePrice ? (
              <>
                <span className="pv-final-price">₹{finalPrice}</span>
                {discount > 0 && (
                  <>
                    <span className="pv-original-price">₹{basePrice.toFixed(2)}</span>
                    <span className="pv-savings">You save ₹{(basePrice - parseFloat(finalPrice)).toFixed(2)}</span>
                  </>
                )}
              </>
            ) : (
              <span className="pv-final-price">Select a variant</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="pv-description">{product.description}</p>
          )}

          <div className="pv-divider" />

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="pv-option-group">
              <span className="pv-option-label">Color: <strong>{selectedColor}</strong></span>
              <div className="pv-color-options">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`pv-color-btn ${selectedColor === color ? "selected" : ""}`}
                    onClick={() => { setSelectedColor(color); setSelectedSize(""); }}
                    title={color}
                  >
                    <span className="pv-color-swatch" style={{ background: color.toLowerCase() }} />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizesForColor.length > 0 && (
            <div className="pv-option-group">
              <span className="pv-option-label">Size: <strong>{selectedSize || "Select"}</strong></span>
              <div className="pv-size-options">
                {sizesForColor.map(size => (
                  <button
                    key={size}
                    className={`pv-size-btn ${selectedSize === size ? "selected" : ""} ${!isSizeInStock(size) ? "oos" : ""}`}
                    onClick={() => isSizeInStock(size) && setSelectedSize(size)}
                    disabled={!isSizeInStock(size)}
                  >
                    {size}
                    {!isSizeInStock(size) && <span className="pv-oos-line" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock info */}
          {selectedVariant && (
            <div className={`pv-stock-info ${selectedVariant.stock > 0 ? "in" : "out"}`}>
              {selectedVariant.stock > 0
                ? `✓ In Stock (${selectedVariant.stock} available)`
                : "✗ Out of Stock"}
            </div>
          )}

          {/* Quantity */}
          <div className="pv-qty-row">
            <span className="pv-option-label">Quantity:</span>
            <div className="pv-qty-box">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 10, q + 1))}>+</button>
            </div>
          </div>

          {/* Cart message */}
          {cartMsg.text && (
            <div className={`pv-cart-msg ${cartMsg.type}`}>{cartMsg.text}</div>
          )}

          {/* CTA buttons */}
          <div className="pv-cta-row">
            <button
              className="pv-add-cart"
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant || selectedVariant?.stock < 1}
            >
              {addingToCart ? "Adding..." : "🛒 Add to Cart"}
            </button>
            <button
              className="pv-buy-now"
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant?.stock < 1}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Variant details table */}
          {selectedVariant && (
            <div className="pv-variant-info">
              <h4>Selected Variant Details</h4>
              <table>
                <tbody>
                  <tr><td>Color</td><td>{selectedVariant.color}</td></tr>
                  <tr><td>Size</td><td>{selectedVariant.size}</td></tr>
                  <tr><td>Price</td><td>₹{parseFloat(selectedVariant.price).toFixed(2)}</td></tr>
                  <tr><td>Stock</td><td>{selectedVariant.stock}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="pv-reviews-section">
        <h2>Reviews & Ratings</h2>

        <div className="pv-reviews-body">
          {/* Review summary */}
          <div className="pv-review-summary">
            {avgRating ? (
              <>
                <div className="pv-big-rating">{avgRating}</div>
                <div className="pv-big-stars">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                </div>
                <p>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </>
            ) : (
              <p className="pv-no-reviews">No reviews yet.<br/>Be the first!</p>
            )}
          </div>

          {/* Write review form */}
          <div className="pv-write-review">
            <h3>Write a Review</h3>
            {reviewMsg && <p className="pv-review-msg">{reviewMsg}</p>}
            <form onSubmit={handleSubmitReview}>
              <div className="pv-star-picker">
                {[1,2,3,4,5].map(s => (
                  <span
                    key={s}
                    className={`pv-pick-star ${s <= (hoverStar || myRating) ? "lit" : ""}`}
                    onClick={() => setMyRating(s)}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                  >★</span>
                ))}
              </div>
              <textarea
                placeholder="Share your thoughts about this product..."
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                rows={4}
              />
              <button type="submit">Submit Review</button>
            </form>
          </div>
        </div>

        {/* Review list */}
        {reviews.length > 0 && (
          <div className="pv-review-list">
            {reviews.map((r, i) => (
              <div key={i} className="pv-review-card">
                <div className="pv-review-header">
                  <div className="pv-reviewer-avatar">{r.user?.username?.[0]?.toUpperCase() || "U"}</div>
                  <div>
                    <strong>{r.user?.username || "Anonymous"}</strong>
                    <div className="pv-review-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= r.rating ? "star filled" : "star"}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="pv-review-date">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.comment && <p className="pv-review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductView;