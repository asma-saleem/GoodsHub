import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      globals: {
        module: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      semi: 'error',
      'no-console': 'error',
      'prefer-const': 'error',
      'comma-dangle': [
        'error',
        'never'
      ],
      'quotes': ['error', 'single'],
      'import/no-named-as-default': 0,
      'import/no-named-as-default-member': 0,
      'import/extensions': 0,
      'no-await-in-loop': 0,
      'no-useless-escape': 0,
      'eqeqeq': 'warn',
      'no-console': 0,
      'no-plusplus': 0,
      'no-unused-vars': 'error',
      'no-underscore-dangle': 0,
      'no-restricted-syntax': 0,
      'no-loop-func': 0,
      'import/prefer-default-export': 0,
      'no-undef': 'error'
    }
  },
];
 export default eslintConfig;

// module.exports = [
//   {
//     languageOptions: {
//       globals: {
//         module: 'readonly',
//         console: 'readonly',
//         process: 'readonly'
//       }
//     },
//     ignores: [
//       'node_modules/*'
//     ],
//     rules: {
//       semi: 'error',
//       'no-console': 'error',
//       'prefer-const': 'error',
//       'comma-dangle': [
//         'error',
//         'never'
//       ],
//       'quotes': ['error', 'single'],
//       'import/no-named-as-default': 0,
//       'import/no-named-as-default-member': 0,
//       'import/extensions': 0,
//       'no-await-in-loop': 0,
//       'no-useless-escape': 0,
//       'eqeqeq': 'warn',
//       'no-console': 0,
//       'no-plusplus': 0,
//       'no-unused-vars': 'error',
//       'no-underscore-dangle': 0,
//       'no-restricted-syntax': 0,
//       'no-loop-func': 0,
//       'import/prefer-default-export': 0,
//       'no-undef': 'error'
//     }
//   }
// ];
