import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';
import { mockSupabase } from '../../test/mocks/supabase';

// Test component to use the auth context
const TestComponent = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for component to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByTestId('loading')).toHaveTextContent('not-loading');
    expect(getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should handle sign in', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = getByText('Sign In');
    signInButton.click();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle sign up', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = getByText('Sign Up');
    signUpButton.click();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        emailRedirectTo: expect.any(String),
        data: {
          phone: 'test@example.com',
          full_name: 'Test User',
        },
      },
    });
  });

  it('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = getByText('Sign Out');
    signOutButton.click();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});