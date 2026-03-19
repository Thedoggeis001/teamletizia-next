import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

await prisma.news.create({
  data: {
    title: "News 1",
    slug: "news-1",
    excerpt: "test",
    content: "Questa è la mia prima news pubblicata!",
    publishedAt: new Date(), // IMPORTANTISSIMO: così è pubblica
  },
});

await prisma.$disconnect();
console.log("✅ Inserita 1 news pubblicata");
