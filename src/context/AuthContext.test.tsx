import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, AuthContext, useAuth } from './AuthContext';

// Helper: renders children inside AuthProvider with MemoryRouter
const renderWithAuth = (ui: React.ReactElement, { route = '/' } = {}) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
    );
};

// Helper: component that exposes the auth context for testing
const AuthConsumer = () => {
    const auth = React.useContext(AuthContext);
    if (!auth) return <div>No context</div>;
    return (
        <div>
            <span data-testid="is-auth">{String(auth.isAuthenticated)}</span>
            <span data-testid="email">{auth.userEmail || 'none'}</span>
            <span data-testid="permissions">{JSON.stringify(auth.userPermissions)}</span>
            <span data-testid="roles">{JSON.stringify(auth.userRoles)}</span>
            <button data-testid="login-btn" onClick={() => auth.login(VALID_JWT)}>Login</button>
            <button data-testid="logout-btn" onClick={() => auth.logout()}>Logout</button>
        </div>
    );
};

// A valid JWT with payload: { sub: "admin@twosix.co", email: "admin@twosix.co", roles: ["admin"], permissions: ["accounting.puc.view", "sales.orders.view"] }
// Created with: btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.signature'
const payload = {
    sub: 'admin@twosix.co',
    email: 'admin@twosix.co',
    roles: ['admin'],
    permissions: ['accounting.puc.view', 'sales.orders.view'],
};
const VALID_JWT = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify(payload)) + '.fake_signature';

// An invalid JWT
const INVALID_JWT = 'not.a.valid.jwt';

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts as unauthenticated when no token in localStorage', () => {
        renderWithAuth(<AuthConsumer />);
        expect(screen.getByTestId('is-auth').textContent).toBe('false');
        expect(screen.getByTestId('email').textContent).toBe('none');
    });

    it('becomes authenticated after login', async () => {
        const user = userEvent.setup();
        renderWithAuth(<AuthConsumer />);

        await user.click(screen.getByTestId('login-btn'));

        expect(screen.getByTestId('is-auth').textContent).toBe('true');
        expect(screen.getByTestId('email').textContent).toBe('admin@twosix.co');
        expect(localStorage.getItem('accessToken')).toBe(VALID_JWT);
    });

    it('becomes unauthenticated after logout', async () => {
        localStorage.setItem('accessToken', VALID_JWT);
        const user = userEvent.setup();
        renderWithAuth(<AuthConsumer />);

        await user.click(screen.getByTestId('logout-btn'));

        expect(screen.getByTestId('is-auth').textContent).toBe('false');
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('decodes roles from JWT payload', async () => {
        const user = userEvent.setup();
        renderWithAuth(<AuthConsumer />);

        await user.click(screen.getByTestId('login-btn'));

        expect(screen.getByTestId('roles').textContent).toBe('["admin"]');
    });

    it('decodes permissions from JWT payload', async () => {
        const user = userEvent.setup();
        renderWithAuth(<AuthConsumer />);

        await user.click(screen.getByTestId('login-btn'));

        expect(screen.getByTestId('permissions').textContent).toContain('accounting.puc.view');
        expect(screen.getByTestId('permissions').textContent).toContain('sales.orders.view');
    });

    it('handles invalid JWT gracefully (stays unauthenticated)', () => {
        localStorage.setItem('accessToken', INVALID_JWT);
        renderWithAuth(<AuthConsumer />);
        expect(screen.getByTestId('is-auth').textContent).toBe('false');
    });

    it('hasPermission returns true when user has the permission', async () => {
        const TestComponent = () => {
            const auth = React.useContext(AuthContext);
            return <span data-testid="has-perm">{String(auth?.hasPermission('accounting.puc.view'))}</span>;
        };

        localStorage.setItem('accessToken', VALID_JWT);
        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId('has-perm').textContent).toBe('true');
    });

    it('hasPermission returns true when user has no permissions (empty = full access)', () => {
        const payloadNoPerms = { sub: 'user@test.co', email: 'user@test.co', roles: [], permissions: [] };
        const jwt = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify(payloadNoPerms)) + '.sig';
        localStorage.setItem('accessToken', jwt);

        const TestComponent = () => {
            const auth = React.useContext(AuthContext);
            return <span data-testid="has-perm">{String(auth?.hasPermission('anything'))}</span>;
        };

        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId('has-perm').textContent).toBe('true');
    });

    it('hasGroupPermission matches prefix correctly', () => {
        localStorage.setItem('accessToken', VALID_JWT);

        const TestComponent = () => {
            const auth = React.useContext(AuthContext);
            return (
                <>
                    <span data-testid="group-acc">{String(auth?.hasGroupPermission('accounting'))}</span>
                    <span data-testid="group-inv">{String(auth?.hasGroupPermission('inventory'))}</span>
                </>
            );
        };

        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId('group-acc').textContent).toBe('true');
        expect(screen.getByTestId('group-inv').textContent).toBe('false');
    });

    it('hasAnyPermission returns true if at least one matches', () => {
        localStorage.setItem('accessToken', VALID_JWT);

        const TestComponent = () => {
            const auth = React.useContext(AuthContext);
            return (
                <>
                    <span data-testid="any-yes">{String(auth?.hasAnyPermission(['accounting.puc.view', 'nonexistent']))}</span>
                    <span data-testid="any-no">{String(auth?.hasAnyPermission(['nonexistent.a', 'nonexistent.b']))}</span>
                </>
            );
        };

        renderWithAuth(<TestComponent />);
        expect(screen.getByTestId('any-yes').textContent).toBe('true');
        expect(screen.getByTestId('any-no').textContent).toBe('false');
    });
});

describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const BadComponent = () => {
            useAuth();
            return <div />;
        };

        expect(() => render(<BadComponent />)).toThrow('useAuth debe usarse dentro de un AuthProvider');
        spy.mockRestore();
    });
});
