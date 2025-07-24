/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./test-setup.ts'],
        include: ['**/*.test.ts', '**/*.spec.ts'],
        exclude: ['node_modules', 'dist', '.encore'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '.encore/',
                'encore.gen/**',
                '**/*.d.ts',
                '**/*.service.ts',
                'test-setup.ts',
                'test-utils.ts',
                'vitest.config.ts'
            ]
        }
    },
    resolve: {
        alias: {
            "~encore": path.resolve(__dirname, "./encore.gen"),
        },
    },
}); 