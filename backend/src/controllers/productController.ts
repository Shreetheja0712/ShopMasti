import { Request, Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// GET /api/products
// Query params: q, category, subcategory, sort, minPrice, maxPrice, inStock
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { q, category, subcategory, sort, minPrice, maxPrice, inStock } = req.query;

        const where: any = { is_active: true };

        // Text search on item name
        if (q) {
            where.name = { contains: String(q), mode: "insensitive" };
        }

        // Category / subcategory filter
        if (subcategory) {
            where.subcategory_id = Number(subcategory);
        } else if (category) {
            where.subcategory = { category_id: Number(category) };
        }

        // Price filter (on variants)
        if (minPrice || maxPrice) {
            where.variants = {
                some: {
                    is_active: true,
                    price: {
                        ...(minPrice ? { gte: Number(minPrice) } : {}),
                        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
                    }
                }
            };
        }

        // In stock filter
        if (inStock === "true") {
            where.variants = {
                ...(where.variants || {}),
                some: {
                    ...(where.variants?.some || {}),
                    is_active: true,
                    stock: { gt: 0 }
                }
            };
        }

        // Sort
        let orderBy: any = { created_at: "desc" }; // default: newest
        if (sort === "name_asc") orderBy = { name: "asc" };
        if (sort === "discount") orderBy = { base_discount: "desc" };
        // price_asc / price_desc are sorted after fetching (variant prices)

        const items = await db.item.findMany({
            where,
            orderBy,
            include: {
                subcategory: {
                    include: { category: true }
                },
                variants: {
                    where: { is_active: true },
                    include: {
                        images: true
                    }
                }
            }
        });

        // Client-side sort for price (needs variant data)
        if (sort === "price_asc") {
            items.sort((a, b) => {
                const aMin = Math.min(...a.variants.map(v => Number(v.price)));
                const bMin = Math.min(...b.variants.map(v => Number(v.price)));
                return aMin - bMin;
            });
        }
        if (sort === "price_desc") {
            items.sort((a, b) => {
                const aMin = Math.min(...a.variants.map(v => Number(v.price)));
                const bMin = Math.min(...b.variants.map(v => Number(v.price)));
                return bMin - aMin;
            });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/products/categories — for sidebar filter
export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await db.category.findMany({
            where: { is_active: true },
            include: {
                subcategories: {
                    where: { is_active: true },
                    select: { id: true, name: true }
                }
            },
            orderBy: { name: "asc" }
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/products/:id — single product with all variants, images, reviews
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const item = await db.item.findFirst({
            where: { id: Number(id), is_active: true },
            include: {
                subcategory: {
                    include: { category: true }
                },
                variants: {
                    where: { is_active: true },
                    include: {
                        images: { orderBy: { is_primary: "desc" } }
                    }
                },
                reviews: {
                    include: {
                        user: { select: { username: true } }
                    },
                    orderBy: { created_at: "desc" }
                }
            }
        });

        if (!item) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/products/:id/reviews — protected
export const addReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user!.userId;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Check if user already reviewed this item (composite PK: user_id + item_id)
        const existing = await db.review.findUnique({
            where: {
                user_id_item_id: {
                    user_id: Number(userId),
                    item_id: Number(id)
                }
            }
        });

        let review;

        if (existing) {
            // Update existing review
            review = await db.review.update({
                where: {
                    user_id_item_id: {
                        user_id: Number(userId),
                        item_id: Number(id)
                    }
                },
                data: { rating: Number(rating), comment },
                include: { user: { select: { username: true } } }
            });
        } else {
            // Create new review
            review = await db.review.create({
                data: {
                    user_id: Number(userId),
                    item_id: Number(id),
                    rating: Number(rating),
                    comment
                },
                include: { user: { select: { username: true } } }
            });
        }

        res.status(201).json(review);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};