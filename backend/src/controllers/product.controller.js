import { db } from "../db/index.js";
import {
  categories,
  products,
  specificationDefinitions,
  productSpecifications,
  productImages,
} from "../db/schema.js";

import { eq, ilike, and, inArray } from "drizzle-orm";

export const getCategories = async (req, res) => {
  try {
    const result = await db.select().from(categories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(ilike(products.name, `%${search}%`));
    }
    if (category) {
      filters.push(eq(products.categoryId, Number(category)));
    }

    const result = await db
      .selectDistinctOn([products.id], {
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        categoryId: products.categoryId,
        image: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(filters.length ? and(...filters) : undefined)
      .limit(limit)
      .offset(offset);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    const specs = await db
      .select({
        name: specificationDefinitions.name,
        value: productSpecifications.value,
      })
      .from(productSpecifications)
      .leftJoin(
        specificationDefinitions,
        eq(productSpecifications.specId, specificationDefinitions.id),
      )
      .where(eq(productSpecifications.productId, productId));

    res.json({
      product: product[0],
      images,
      specifications: specs,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const getProductsByIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(",").map(Number);

    const result = await db
      .selectDistinctOn([products.id], {
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        image: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(inArray(products.id, ids));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
