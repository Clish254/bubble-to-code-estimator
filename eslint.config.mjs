import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /* eslint-disable no-restricted-syntax */
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/[—]/]",
          message: "Em dashes (—) are not allowed. Use hyphens (-) instead."
        },
        {
          selector: "JSXText[value=/[—]/]",
          message: "Em dashes (—) are not allowed. Use hyphens (-) instead."
        },
        {
          selector: "TemplateElement[value.raw=/[—]/]",
          message: "Em dashes (—) are not allowed. Use hyphens (-) instead."
        }
      ]
    }
    /* eslint-enable no-restricted-syntax */
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
  ]),
]);

export default eslintConfig;
