import { db } from "./index.js";
import {
  categories,
  products,
  productImages,
  specificationDefinitions,
  productSpecifications,
} from "./schema.js";

await db.execute(`
  TRUNCATE TABLE 
    product_specifications,
    product_images,
    products,
    specification_definitions,
    categories
  RESTART IDENTITY CASCADE
`);

async function seed() {
  console.log("Seeding database...");

  /* ----------------- CATEGORIES ----------------- */

  const insertedCategories = await db
    .insert(categories)
    .values([
      { name: "Electronics" },
      { name: "Books" },
      { name: "Clothing" },
      { name: "Shoes" },
      { name: "Home" },
    ])
    .returning();

  const electronicsId = insertedCategories.find(
    (c) => c.name === "Electronics",
  ).id;
  const booksId = insertedCategories.find((c) => c.name === "Books").id;
  const clothingId = insertedCategories.find((c) => c.name === "Clothing").id;
  const shoesId = insertedCategories.find((c) => c.name === "Shoes").id;
  const homeId = insertedCategories.find((c) => c.name === "Home").id;

  const categoryMap = {
    Electronics: electronicsId,
    Books: booksId,
    Clothing: clothingId,
    Shoes: shoesId,
    Home: homeId,
  };

  const categoryFolders = {
    [electronicsId]: "electronics",
    [booksId]: "books",
    [clothingId]: "clothing",
    [shoesId]: "shoes",
    [homeId]: "home",
  };

  /* ----------------- PRODUCT CATALOG ----------------- */

  const catalog = {
    Electronics: [
      "MacBook Air M2",
      "iPhone 15",
      "Samsung Galaxy S23",
      "Sony WH-1000XM5",
      "iPad Air",
      "Dell XPS 13",
      "Logitech MX Master Mouse",
      "Apple Watch Series 9",
      "PlayStation 5",
      "Nintendo Switch",
    ],

    Books: [
      "Atomic Habits",
      "Deep Work",
      "Clean Code",
      "The Pragmatic Programmer",
      "Zero to One",
      "The Lean Startup",
      "Rich Dad Poor Dad",
      "The Psychology of Money",
      "Think and Grow Rich",
      "The Alchemist",
    ],

    Clothing: [
      "Nike Running T-Shirt",
      "Adidas Training Shorts",
      "Levi's Slim Jeans",
      "Puma Sports Jacket",
      "Under Armour Hoodie",
      "Zara Casual Shirt",
      "H&M Cotton T-Shirt",
      "Uniqlo Polo Shirt",
      "Reebok Gym Tank",
      "Decathlon Sports Tee",
    ],

    Shoes: [
      "Nike Air Zoom Pegasus",
      "Adidas Ultraboost",
      "Puma Running Shoes",
      "New Balance 574",
      "Converse Chuck Taylor",
      "Vans Old Skool",
      "Reebok Nano X",
      "Asics Gel Nimbus",
      "Fila Disruptor",
      "Skechers Go Walk",
    ],

    Home: [
      "Philips Air Fryer",
      "Dyson Vacuum Cleaner",
      "Ikea Study Desk",
      "Philips LED Lamp",
      "Milton Water Bottle",
      "Prestige Pressure Cooker",
      "Amazon Basics Office Chair",
      "Noise Smart Speaker",
      "Samsung Microwave Oven",
      "LG Washing Machine",
    ],
  };

  /* ----------------- INSERT PRODUCTS ----------------- */
  function generatePrice() {
    const base = Math.floor(Math.random() * 15) + 1;
    const multiplier = Math.pow(10, Math.floor(Math.random() * 3) + 2);

    const endings = [0, 50, 99];
    const ending = endings[Math.floor(Math.random() * endings.length)];

    const price = (base * multiplier) / 10 + ending;

    return price.toString();
  }

  function generateDescription(name) {
    const phrases = [
      "high quality product",
      "premium build and performance",
      "designed for everyday use",
      "trusted by thousands of customers",
      "top rated product in its category",
      "perfect balance of quality and value",
      "built with durable materials",
      "modern design with reliable performance",
      "great choice for daily use",
      "engineered for comfort and efficiency",
    ];

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `${name} - ${phrase}`;
  }

  const productRows = [];

  for (const [categoryName, items] of Object.entries(catalog)) {
    const categoryId = categoryMap[categoryName];

    for (const name of items) {
      productRows.push({
        name,
        description: generateDescription(name),
        price: generatePrice(),
        stock: Math.floor(Math.random() * 51),
        categoryId,
      });
    }
  }

  const insertedProducts = await db
    .insert(products)
    .values(productRows)
    .returning();

  /* ----------------- PRODUCT IMAGES ----------------- */

  const imageRows = [];

  for (const product of insertedProducts) {
    for (let i = 1; i <= 3; i++) {
      imageRows.push({
        productId: product.id,
        imageUrl: `/products/${product.id}/${i}.jpg`,
        displayOrder: i,
      });
    }
  }

  await db.insert(productImages).values(imageRows);

  /* ----------------- SPEC DEFINITIONS ----------------- */

  const specDefinitions = [
    // Electronics
    { categoryId: electronicsId, name: "Brand", displayOrder: 1 },
    { categoryId: electronicsId, name: "Processor", displayOrder: 2 },
    { categoryId: electronicsId, name: "RAM", displayOrder: 3 },
    { categoryId: electronicsId, name: "Storage", displayOrder: 4 },

    // Books
    { categoryId: booksId, name: "Author", displayOrder: 1 },
    { categoryId: booksId, name: "Language", displayOrder: 2 },
    { categoryId: booksId, name: "Pages", displayOrder: 3 },
    { categoryId: booksId, name: "Publisher", displayOrder: 4 },

    // Clothing
    { categoryId: clothingId, name: "Brand", displayOrder: 1 },
    { categoryId: clothingId, name: "Material", displayOrder: 2 },
    { categoryId: clothingId, name: "Fit", displayOrder: 3 },
    { categoryId: clothingId, name: "Size", displayOrder: 4 },

    // Shoes
    { categoryId: shoesId, name: "Brand", displayOrder: 1 },
    { categoryId: shoesId, name: "Material", displayOrder: 2 },
    { categoryId: shoesId, name: "Sole", displayOrder: 3 },
    { categoryId: shoesId, name: "Size", displayOrder: 4 },

    // Home
    { categoryId: homeId, name: "Brand", displayOrder: 1 },
    { categoryId: homeId, name: "Material", displayOrder: 2 },
    { categoryId: homeId, name: "Warranty", displayOrder: 3 },
    { categoryId: homeId, name: "Weight", displayOrder: 4 },
  ];

  const specs = await db
    .insert(specificationDefinitions)
    .values(specDefinitions)
    .returning();

  /* ----------------- PRODUCT SPECS ----------------- */

  const specRows = [];

  for (const product of insertedProducts) {
    const productSpecs = specs.filter(
      (s) => s.categoryId === product.categoryId,
    );

    for (const spec of productSpecs) {
      let value = "Standard";

      if (spec.name === "Brand") value = "Generic";
      if (spec.name === "Processor") value = "Octa Core";
      if (spec.name === "RAM") value = "8GB";
      if (spec.name === "Storage") value = "256GB";
      if (spec.name === "Author") value = "Unknown Author";
      if (spec.name === "Language") value = "English";
      if (spec.name === "Pages") value = "320";
      if (spec.name === "Publisher") value = "Penguin";
      if (spec.name === "Material") value = "Cotton";
      if (spec.name === "Fit") value = "Regular";
      if (spec.name === "Size") value = "Medium";
      if (spec.name === "Sole") value = "Rubber";
      if (spec.name === "Warranty") value = "1 Year";
      if (spec.name === "Weight") value = "1.2 kg";

      specRows.push({
        productId: product.id,
        specId: spec.id,
        value,
      });
    }
  }

  await db.insert(productSpecifications).values(specRows);

  console.log("Seed completed successfully!");
}

seed().then(() => process.exit());
