import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
    redirect: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
    useAuth: () => ({
        userId: 'test-user-id',
        isLoaded: true,
    }),
    useUser: () => ({
        user: {
            id: 'test-user-id',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
        isLoaded: true,
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_PAGINATION_TASKS_LIMIT', '10'); 