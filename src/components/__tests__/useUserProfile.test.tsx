import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserProfile } from '../useUserProfile';
import { mockSupabase } from '../../test/mocks/supabase';

// Mock the AuthProvider
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' }
};

vi.mock('../AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    loading: false,
  }),
}));

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user profile successfully', async () => {
    const mockProfile = {
      id: 'profile-id',
      user_id: 'test-user-id',
      full_name: 'Test User',
      role: 'customer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockSupabase.from().maybeSingle.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const { result } = renderHook(() => useUserProfile());

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSupport).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should identify admin user correctly', async () => {
    const mockAdminProfile = {
      id: 'admin-profile-id',
      user_id: 'test-user-id',
      full_name: 'Admin User',
      role: 'admin',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockSupabase.from().maybeSingle.mockResolvedValue({
      data: mockAdminProfile,
      error: null,
    });

    const { result } = renderHook(() => useUserProfile());

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSupport).toBe(true);
  });

  it('should create profile when none exists', async () => {
    const newProfile = {
      id: 'new-profile-id',
      user_id: 'test-user-id',
      full_name: 'Test User',
      role: 'customer',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    // First call returns no profile
    mockSupabase.from().maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Insert call returns new profile
    mockSupabase.from().select().single.mockResolvedValue({
      data: newProfile,
      error: null,
    });

    const { result } = renderHook(() => useUserProfile());

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      user_id: 'test-user-id',
      full_name: 'Test User',
      role: 'customer',
    });
    expect(result.current.profile).toEqual(newProfile);
  });

  it('should handle errors gracefully', async () => {
    mockSupabase.from().maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const { result } = renderHook(() => useUserProfile());

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.profile).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});