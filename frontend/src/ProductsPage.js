import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter + sort state pulled from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get("subcategory") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceMin, setPriceMin] = useState(searchParams.get("minPrice") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubCategory, sortBy, priceMin, priceMax, inStockOnly, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedSubCategory) params.set("subcategory", selectedSubCategory);
      if (sortBy) params.set("sort", sortBy);
      if (priceMin) params.set("minPrice", priceMin);
      if (priceMax) params.set("maxPrice", priceMax);
      if (inStockOnly) params.set("inStock", "true");

      setSearchParams(params);

      const res = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        setError("Failed to load products.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
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

  const selectedCategoryData = categories.find(c => String(c.id) === String(selectedCategory));

  return (
    <div className="pp-root">

      {/* Top bar */}
      <div className="pp-topbar">
        <button className="pp-back" onClick={() => navigate("/")}>← Back to Home</button>
        <form className="pp-searchbar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select className="pp-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount">Best Discount</option>
          <option value="name_asc">Name: A–Z</option>
        </select>
      </div>

      <div className="pp-body">

        {/* Sidebar */}
        <aside className="pp-sidebar">
          <div className="pp-sidebar-header">
            <h3>Filters</h3>
            <button onClick={clearFilters}>Clear all</button>
          </div>

          {/* Category filter */}
          <div className="pp-filter-section">
            <h4>Category</h4>
            <div className="pp-filter-options">
              <label className={!selectedCategory ? "active" : ""}>
                <input type="radio" name="category" value="" checked={!selectedCategory}
                  onChange={() => { setSelectedCategory(""); setSelectedSubCategory(""); }} />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} className={String(selectedCategory) === String(cat.id) ? "active" : ""}>
                  <input type="radio" name="category" value={cat.id}
                    checked={String(selectedCategory) === String(cat.id)}
                    onChange={() => { setSelectedCategory(cat.id); setSelectedSubCategory(""); }} />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* SubCategory filter — only shows if a category is selected */}
          {selectedCategoryData?.subcategories?.length > 0 && (
            <div className="pp-filter-section">
              <h4>Sub-Category</h4>
              <div className="pp-filter-options">
                <label className={!selectedSubCategory ? "active" : ""}>
                  <input type="radio" name="subcategory" value="" checked={!selectedSubCategory}
                    onChange={() => setSelectedSubCategory("")} />
                  All
                </label>
                {selectedCategoryData.subcategories.map(sub => (
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

          {/* Price range */}
          <div className="pp-filter-section">
            <h4>Price Range (₹)</h4>
            <div className="pp-price-inputs">
              <input type="number" placeholder="Min" value={priceMin}
                onChange={e => setPriceMin(e.target.value)} />
              <span>–</span>
              <input type="number" placeholder="Max" value={priceMax}
                onChange={e => setPriceMax(e.target.value)} />
            </div>
            <button className="pp-apply-price" onClick={fetchProducts}>Apply</button>
          </div>

          {/* In stock toggle */}
          <div className="pp-filter-section">
            <label className="pp-toggle-label">
              <input type="checkbox" checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)} />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Product grid */}
        <main className="pp-main">
          <div className="pp-results-header">
            <span>{products.length} product{products.length !== 1 ? "s" : ""} found</span>
            {(selectedCategory || searchQuery || priceMin || priceMax || inStockOnly) && (
              <button className="pp-clear-inline" onClick={clearFilters}>✕ Clear filters</button>
            )}
          </div>

          {loading ? (
            <div className="pp-loading">
              <div className="pp-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="pp-error">{error}</div>
          ) : products.length === 0 ? (
            <div className="pp-empty">
              <p>No products found.</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="pp-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;