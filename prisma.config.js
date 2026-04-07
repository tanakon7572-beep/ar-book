require('dotenv').config();
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // We use DIRECT_URL for migrations to bypass transaction poolers.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
