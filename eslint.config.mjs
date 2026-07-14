import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: [
      'app/blog/**/*.tsx',
      'app/library/**/*.tsx',
      'components/home-cinema/HomeCinema.tsx',
      'components/library/ReadingBody.tsx',
    ],
    rules: {
      // These static-export editorial images own explicit dimensions and runtime fallbacks.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: [
      'app/blog/**/BlogArticle.tsx',
      'app/learn/diagnostic/LearnPlacementClient.tsx',
      'components/CinematicBoot.tsx',
      'components/brain2/Brain2ProgressClient.tsx',
      'components/brain2/Brain2ProtectedLesson.tsx',
      'components/library/ReadingToolbar.tsx',
    ],
    rules: {
      // These effects intentionally hydrate browser storage or bootstrap an external API state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.playwright-cli/**',
    '.superpowers/**',
    '.worktrees/**',
    '.wrangler/**',
    'artifacts/**',
    'build/**',
    'next-env.d.ts',
    'out/**',
    'output/**',
    'public/conanmaker/assets/**',
    'public/game/assets/**',
    'scripts/fixtures/**',
  ]),
])
