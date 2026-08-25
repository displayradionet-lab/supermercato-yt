import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';

const NEON_URL =
  process.env.NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_ynRmNdUKp56G@ep-withered-flower-b2gf4bwo-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(NEON_URL);

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await sql`SELECT * FROM "Product"`;
    res.json(products);
  } catch (error: any) {
    console.error('❌ ERRORE GET_PRODUCTS:', error);
    res.status(500).json({
      error: 'Errore durante il recupero dei prodotti',
      dettaglioErrore: error?.message || String(error),
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const products =
      await sql`SELECT * FROM "Product" WHERE id = ${id} LIMIT 1`;
    if (products.length === 0)
      return res.status(404).json({ error: 'Prodotto non trovato' });
    res.json(products[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Errore durante il recupero del prodotto' });
  }
};

export const getDeals = async (req: Request, res: Response) => {
  try {
    const deals = await sql`SELECT * FROM "Product" WHERE "originalPrice" > 0`;
    res.json(deals);
  } catch (error: any) {
    res.status(500).json({ error: 'Errore durante il recupero delle offerte' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      rating,
      reviewsCount,
      inStock,
    } = req.body;
    const result = await sql`
      INSERT INTO "Product" (id, name, description, price, "originalPrice", category, image, rating, "reviewsCount", "inStock", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${description}, ${price}, ${originalPrice || null}, ${category}, ${image}, ${rating || 0}, ${reviewsCount || 0}, ${inStock ?? true}, NOW(), NOW())
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('❌ ERRORE CREATE_PRODUCT:', error);
    res
      .status(500)
      .json({
        error: 'Errore durante la creazione del prodotto',
        dettaglioErrore: error?.message,
      });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      rating,
      reviewsCount,
      inStock,
    } = req.body;
    const result = await sql`
      UPDATE "Product"
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          price = COALESCE(${price}, price),
          "originalPrice" = COALESCE(${originalPrice}, "originalPrice"),
          category = COALESCE(${category}, category),
          image = COALESCE(${image}, image),
          rating = COALESCE(${rating}, rating),
          "reviewsCount" = COALESCE(${reviewsCount}, "reviewsCount"),
          "inStock" = COALESCE(${inStock}, "inStock"),
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0)
      return res.status(404).json({ error: 'Prodotto non trovato' });
    res.json(result[0]);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Errore durante l'aggiornamento del prodotto" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await sql`DELETE FROM "Product" WHERE id = ${id}`;
    res.json({ message: 'Prodotto eliminato con successo' });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Errore durante l'eliminazione del prodotto" });
  }
};
