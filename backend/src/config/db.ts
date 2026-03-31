import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DB_URL!;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export default db;
