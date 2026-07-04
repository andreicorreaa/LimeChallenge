import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

// Start MSW mock server before all tests run
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (prevents leak between test cases)
afterEach(() => server.resetHandlers());

// Clean up server after tests finish
afterAll(() => server.close());
