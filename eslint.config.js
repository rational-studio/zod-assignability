import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      // Require braces for all control statements
      curly: ['error', 'all'],
    },
  },
  {
    // Common ignores for build artifacts
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/'],
  },
];
