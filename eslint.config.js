// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Deno Edge Function code - different runtime/globals (Deno, npm:
    // specifiers), not part of the Expo app's lint/type surface.
    ignores: ['dist/*', 'supabase/functions/**'],
  },
]);
