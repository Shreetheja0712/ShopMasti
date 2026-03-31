import React, { useState, useEffect } from "react";
import {useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import { apiFetch } from "../../utils/api";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get("subcategory") || "");
  const [upperFilter] = useState(searchParams.get("upper") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceMin, setPriceMin] = useState(searchParams.get("minPrice") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");

  // eventId passed when coming from event viewer
  const eventId = searchParams.get("eventId") || null;

  useEffect(() => { fetchCategories(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); },
    [selectedCategory, selectedSubCategory, sortBy, priceMin, priceMax, inStockOnly, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch("/products/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch { }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedSubCategory) params.set("subcategory", selectedSubCategory);
      if (upperFilter) params.set("upper", upperFilter);
      if (sortBy) params.set("sort", sortBy);
      if (priceMin) params.set("minPrice", priceMin);
      if (priceMax) params.set("maxPrice", priceMax);
      if (inStockOnly) params.set("inStock", "true");
      if (eventId) params.set("eventId", eventId);
      setSearchParams(params);

      const res = await apiFetch(`/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setProducts(data);
      else setError("Failed to load products.");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setSortBy("newest");
    setSearchQuery("");
  };

  const selectedCategoryData = categories.find(
    (c) => String(c.id) === String(selectedCategory)
  );

  return (
    <>
      <Navbar
        onOpenLogin={() => setLoginOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      <div className="sm-page">
        <div className="pp-root">

          {/* Sort bar */}
          <div className="pp-sortbar">
            <span className="pp-result-count">
              {products.length} product{products.length !== 1 ? "s" : ""} found
              {eventId && <span className="pp-event-tag"> · Event Shopping Mode</span>}
            </span>
            <div className="pp-sort-controls">
              <select className="pp-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="discount">Best Discount</option>
                <option value="name_asc">Name: A–Z</option>
              </select>
            </div>
          </div>

          <div className="pp-body">
            {/* Sidebar */}
            <aside className="pp-sidebar">
              <div className="pp-sidebar-header">
                <h3>Filters</h3>
                <button onClick={clearFilters}>Clear all</button>
              </div>

              {/* Search */}
              <div className="pp-filter-section">
                <h4>Search</h4>
                <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="pp-search-form">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">Go</button>
                </form>
              </div>

              {/* Category */}
              <div className="pp-filter-section">
                <h4>Category</h4>
                <div className="pp-filter-options">
                  <label className={!selectedCategory ? "active" : ""}>
                    <input type="radio" name="category" value=""
                      checked={!selectedCategory}
                      onChange={() => { setSelectedCategory(""); setSelectedSubCategory(""); }} />
                    All Categories
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className={String(selectedCategory) === String(cat.id) ? "active" : ""}>
                      <input type="radio" name="category" value={cat.id}
                        checked={String(selectedCategory) === String(cat.id)}
                        onChange={() => { setSelectedCategory(cat.id); setSelectedSubCategory(""); }} />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategory */}
              {selectedCategoryData?.subcategories?.length > 0 && (
                <div className="pp-filter-section">
                  <h4>Sub-Category</h4>
                  <div className="pp-filter-options">
                    <label className={!selectedSubCategory ? "active" : ""}>
                      <input type="radio" name="subcategory" value="" checked={!selectedSubCategory}
                        onChange={() => setSelectedSubCategory("")} />
                      All
                    </label>
                    {selectedCategoryData.subcategories.map((sub) => (
                      <label key={sub.id} className={String(selectedSubCategory) === String(sub.id) ? "active" : ""}>
                        <input type="radio" name="subcategory" value={sub.id}
                          checked={String(selectedSubCategory) === String(sub.id)}
                          onChange={() => setSelectedSubCategory(sub.id)} />
                        {sub.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="pp-filter-section">
                <h4>Price Range (₹)</h4>
                <div className="pp-price-inputs">
                  <input type="number" placeholder="Min" value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)} />
                  <span>–</span>
                  <input type="number" placeholder="Max" value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)} />
                </div>
                <button className="pp-apply-price" onClick={fetchProducts}>Apply</button>
              </div>

              {/* Stock */}
              <div className="pp-filter-section">
                <label className="pp-toggle-label">
                  <input type="checkbox" checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)} />
                  In Stock Only
                </label>
              </div>
            </aside>

            {/* Grid */}
            <main className="pp-main">
              {loading ? (
                <div className="sm-state-center"><div className="sm-spinner" /><p>Loading products...</p></div>
              ) : error ? (
                <div className="pp-error">{error}</div>
              ) : products.length === 0 ? (
                <div className="sm-state-center">
                  <p>No products found.</p>
                  <button className="pp-clear-btn" onClick={clearFilters}>Clear filters</button>
                </div>
              ) : (
                <div className="pp-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} eventId={eventId} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
        <Footer />
      </div>

      {loginOpen && (
        <div className="sm-overlay" onClick={() => setLoginOpen(false)}>
          <div className="sm-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="sm-popup-close" onClick={() => setLoginOpen(false)}>×</button>
            <Login switchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} onSuccess={() => setLoginOpen(false)} />
          </div>
        </div>
      )}
      {registerOpen && (
        <div className="sm-overlay" onClick={() => setRegisterOpen(false)}>
          <div className="sm-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="sm-popup-close" onClick={() => setRegisterOpen(false)}>×</button>
            <Register switchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductsPage;
