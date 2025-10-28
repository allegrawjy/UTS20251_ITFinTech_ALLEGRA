// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next"; // ✅ base Next.js config
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"; // ✅ performance rules

export default defineConfig([
  ...next,
  ...nextCoreWebVitals,
  {
    ignores: [
      // Default ignores + your custom ones
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "dist/**",
    ],
  },
]);
