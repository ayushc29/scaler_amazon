import { addresses } from "../db/schema.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { USER_ID } from "../utils/constants.js";

export const createAddress = async (req, res) => {
  try {
    const data = req.body;

    const address = await db
      .insert(addresses)
      .values({
        ...data,
        userId: 1
      })
      .returning();

    res.json(address[0]);

  } catch (err) {
    res.status(500).json({ error: "Failed to save address" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, USER_ID));

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(addresses)
      .where(eq(addresses.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete address" });
  }
};