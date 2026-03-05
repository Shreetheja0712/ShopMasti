import "dotenv/config";
import { Pool } from "pg"; // You need to install 'pg' and '@types/pg'
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const connectionString = process.env.DB_URL!;

// 1. Setup the Pool first, then pass it to the adapter

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(" Seeding started...");
  console.log(" DB URL:", connectionString);

  // --- ROLES ---

  await prisma.role.createMany({
    data: [{ name: "ADMIN" }, { name: "CUSTOMER" }],
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMIN" },
  });

  const customerRole = await prisma.role.findUniqueOrThrow({
    where: { name: "CUSTOMER" },
  });

  // --- ADMIN USER ---

  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@shopmasti.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@shopmasti.com",
      password: adminPassword,
      role_id: adminRole.id,
    },
  });

  // --- FAKE CUSTOMERS ---
  const customerPassword = await bcrypt.hash("test123", 10);

  // Generate data in memory first
  const customerData = Array.from({ length: 20 }).map(() => ({
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: customerPassword,
    mobile_number: faker.phone.number(),
    country: "India",
    role_id: customerRole.id,
  }));

  // Batch insert for performance
  await prisma.user.createMany({
    data: customerData,
    skipDuplicates: true,
  });

  console.log(
    `Seeding finished. Created Admin and ${customerData.length} Customers.`,
  );
  // ===========================================
  // 2. CATEGORIES
  // ===========================================
  console.log("--- Seeding Categories ---");

  // Helper to create or get category (to avoid duplicates on re-runs)
  const upsertCategory = async (name: string, desc: string) => {
    return prisma.category.upsert({
      where: { name }, // Assumes 'name' is @unique in schema
      update: {},
      create: { name, description: desc },
    });
  };

  const clothing = await upsertCategory(
    "Clothing",
    "Apparel and fashion items",
  );
  const footwear = await upsertCategory("Footwear", "Shoes and sandals");
  const accessories = await upsertCategory(
    "Accessories",
    "Watches, belts, bags etc",
  );
  const electronics = await upsertCategory("Electronics", "Electronic gadgets");

  // ... (previous code for Users and Categories)

  // ===========================================
  // 3. SUBCATEGORIES (Fixed for non-unique names)
  // ===========================================
  console.log("--- Seeding Subcategories ---");

  // Helper: "Find existing OR Create new"
  const ensureSubCategory = async (name: string, categoryId: number) => {
    // 1. Search for it first
    const existing = await prisma.subCategory.findFirst({
      where: {
        name: name,
        category_id: categoryId, // Check name AND category to be safe
      },
    });

    if (existing) {
      return existing; // Found it! Return existing record.
    }

    // 2. If not found, create it
    return prisma.subCategory.create({
      data: {
        name,
        category_id: categoryId,
      },
    });
  };

  // Now use the helper safely
  const shirts = await ensureSubCategory("Shirts", clothing.id);
  const jeans = await ensureSubCategory("Jeans", clothing.id);
  const sarees = await ensureSubCategory("Sarees", clothing.id); // Assuming clothing for now

  const shoes = await ensureSubCategory("Shoes", footwear.id);

  const watches = await ensureSubCategory("Watches", accessories.id);
  const bags = await ensureSubCategory("Bags", accessories.id);

  console.log("Subcategories seeded");

  // ... (Continue with Events code)
  // 4. EVENTS
  // ===========================================
  console.log("--- Seeding Events ---");

  const upsertEvent = async (name: string, desc: string) => {
    return prisma.eventType.upsert({
      where: { name },
      update: {},
      create: { name, description: desc },
    });
  };

  const marriage = await upsertEvent("Marriage", "Wedding shopping essentials");
  const college = await upsertEvent("New College", "Shopping for college life");
  const travel = await upsertEvent("Foreign Travel", "Travel essentials");

  // ===========================================
  // 5. EVENT MAPPINGS (Many-to-Many)
  // ===========================================
  console.log("--- Mapping Events to Subcategories ---");

  await prisma.eventSubCategory.createMany({
    data: [
      { event_id: marriage.id, subcategory_id: sarees.id },
      { event_id: marriage.id, subcategory_id: shirts.id },
      { event_id: marriage.id, subcategory_id: shoes.id },

      { event_id: college.id, subcategory_id: shirts.id },
      { event_id: college.id, subcategory_id: jeans.id },
      { event_id: college.id, subcategory_id: bags.id },

      { event_id: travel.id, subcategory_id: bags.id },
      { event_id: travel.id, subcategory_id: shoes.id },
      { event_id: travel.id, subcategory_id: watches.id },
    ],
    skipDuplicates: true, // Crucial! Prevents crashing if run twice
  });

  console.log("Event mappings seeded");
}

main()
  .catch((e) => {
    console.error(" Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect properly
    await prisma.$disconnect();
  });
