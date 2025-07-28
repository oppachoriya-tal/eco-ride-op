import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';
import { mockSupabase } from '../../test/mocks/supabase';

// Mock the useUserProfile hook
const mockUseUserProfile = vi.fn();
vi.mock('../../components/useUserProfile', () => ({
  useUserProfile: () => mockUseUserProfile(),
}));

// Mock toast
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock child components
vi.mock('../../components/SupportTicketManager', () => ({
  SupportTicketManager: () => <div data-testid="support-ticket-manager">Support Ticket Manager</div>,
}));

vi.mock('../../components/OffersManager', () => ({
  OffersManager: () => <div data-testid="offers-manager">Offers Manager</div>,
}));

vi.mock('../../components/KnowledgeBaseManager', () => ({
  KnowledgeBaseManager: () => <div data-testid="knowledge-base-manager">Knowledge Base Manager</div>,
}));

vi.mock('../../components/ChatAnalytics', () => ({
  ChatAnalytics: () => <div data-testid="chat-analytics">Chat Analytics</div>,
}));

const renderAdminDashboard = () => {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from().select().order.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it('should show loading state', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      isAdmin: false,
      loading: true,
    });

    const { getByText } = renderAdminDashboard();

    expect(getByText('Loading admin dashboard...')).toBeInTheDocument();
  });

  it('should show access denied for non-admin users', () => {
    mockUseUserProfile.mockReturnValue({
      profile: { full_name: 'Test User', role: 'customer' },
      isAdmin: false,
      loading: false,
    });

    const { getByText } = renderAdminDashboard();

    expect(getByText('Access Denied')).toBeInTheDocument();
    expect(getByText("You don't have admin privileges to access this page.")).toBeInTheDocument();
  });

  it('should render admin dashboard for admin users', async () => {
    mockUseUserProfile.mockReturnValue({
      profile: { full_name: 'Admin User', role: 'admin' },
      isAdmin: true,
      loading: false,
    });

    // Mock API responses
    mockSupabase.from().select().order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { getByText } = renderAdminDashboard();

    // Wait for component to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Admin Dashboard')).toBeInTheDocument();
    expect(getByText('Welcome back, Admin User')).toBeInTheDocument();

    // Check for stats cards
    expect(getByText('Total Tickets')).toBeInTheDocument();
    expect(getByText('Open Tickets')).toBeInTheDocument();
    expect(getByText('In Progress')).toBeInTheDocument();
    expect(getByText('Resolved')).toBeInTheDocument();
  });

  it('should render tabs with correct components', async () => {
    mockUseUserProfile.mockReturnValue({
      profile: { full_name: 'Admin User', role: 'admin' },
      isAdmin: true,
      loading: false,
    });

    mockSupabase.from().select().order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { getByText } = renderAdminDashboard();

    // Wait for component to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Admin Dashboard')).toBeInTheDocument();

    // Check tabs
    expect(getByText('Support Tickets')).toBeInTheDocument();
    expect(getByText('User Management')).toBeInTheDocument();
    expect(getByText('Offers & Promotions')).toBeInTheDocument();
    expect(getByText('Knowledge Base')).toBeInTheDocument();
    expect(getByText('Chat Analytics')).toBeInTheDocument();
  });

  it('should display correct stats when tickets are present', async () => {
    mockUseUserProfile.mockReturnValue({
      profile: { full_name: 'Admin User', role: 'admin' },
      isAdmin: true,
      loading: false,
    });

    const mockTickets = [
      { id: '1', status: 'open', priority: 'urgent', created_at: new Date().toISOString() },
      { id: '2', status: 'in_progress', priority: 'medium', created_at: new Date().toISOString() },
      { id: '3', status: 'resolved', priority: 'low', created_at: new Date().toISOString() },
    ];

    mockSupabase.from().select().order.mockResolvedValueOnce({
      data: mockTickets,
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { getByText } = renderAdminDashboard();

    // Wait for component to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('3')).toBeInTheDocument(); // Total tickets
  });
});