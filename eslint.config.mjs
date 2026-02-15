// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    // eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
        },
    },

    // ========== CLEAN ARCHITECTURE ENFORCEMENT ==========

    // DOMAIN layer: cannot import from application, infrastructure, or @nestjs
    {
        files: ['src/**/domain/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/application/**'],
                            message:
                                'DOMAIN layer cannot import from APPLICATION layer.',
                        },
                        {
                            group: ['**/infrastructure/**'],
                            message:
                                'DOMAIN layer cannot import from INFRASTRUCTURE layer.',
                        },
                        {
                            group: ['@nestjs/*'],
                            message:
                                'DOMAIN layer cannot import from NestJS. Keep domain framework-free.',
                        },
                    ],
                },
            ],
        },
    },

    // APPLICATION layer: cannot import from infrastructure or @nestjs
    {
        files: ['src/**/application/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/infrastructure/**'],
                            message:
                                'APPLICATION layer cannot import from INFRASTRUCTURE layer.',
                        },
                        {
                            group: ['@nestjs/*'],
                            message:
                                'APPLICATION layer cannot import from NestJS. Use cases must be framework-free.',
                        },
                    ],
                },
            ],
        },
    },
);
