import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      include: ["src/lib/validation.ts"],
      exclude: ["**/*.{test,spec}.{ts,tsx}"],
      reportOnFailure: true,
    },
  },
});
