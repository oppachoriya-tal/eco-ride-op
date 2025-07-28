# EcoScooter Support System

A comprehensive customer support and management platform for electric scooter services, featuring AI-powered chat support, knowledge base management, and administrative dashboards.

## 🚀 Project Overview

### Problem Statement

Electric scooter sharing services face several operational challenges:
- **High Volume Support Requests**: Manual handling of customer inquiries creates bottlenecks
- **Repetitive Questions**: Common issues like battery problems, charging, and troubleshooting consume significant support resources
- **Scattered Information**: Support knowledge is often fragmented across different systems
- **Limited Analytics**: Lack of insights into support patterns and performance metrics
- **Role Management**: Need for different access levels for admins, support staff, and customers

### Solution

Our EcoScooter Support System provides:
- **AI-Powered Chat Support**: Intelligent chatbot that handles common queries using a curated knowledge base
- **Centralized Knowledge Management**: Organized repository of troubleshooting guides, maintenance procedures, and FAQs
- **Role-Based Access Control**: Secure authentication with admin, support, and customer roles
- **Real-time Analytics**: Comprehensive dashboards for monitoring support performance and user interactions
- **Integrated Ticket Management**: Seamless escalation from chat to human support when needed

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Edge          │
│   (React SPA)   │◄──►│   Backend       │◄──►│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │  Auth   │             │Database │             │AI Chat  │
    │ System  │             │  (RLS)  │             │Support  │
    └─────────┘             └─────────┘             └─────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── AuthProvider.tsx         # Authentication context
│   ├── useUserProfile.tsx       # User profile hook
│   ├── ChatSupport.tsx          # AI chat interface
│   ├── ChatAnalytics.tsx        # Analytics dashboard
│   ├── KnowledgeBaseManager.tsx # Knowledge management
│   ├── SupportTicketManager.tsx # Ticket system
│   └── ui/                      # Reusable UI components
├── pages/
│   ├── Auth.tsx                 # Authentication page
│   ├── Dashboard.tsx            # Customer dashboard
│   ├── AdminDashboard.tsx       # Admin interface
│   └── Index.tsx                # Landing page
└── integrations/
    └── supabase/                # Database integration
```

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks and context
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components
- **React Router**: Client-side routing
- **React Query**: Server state management

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Built-in authentication
  - Edge Functions for serverless compute

### Testing
- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing utilities
- **Jest DOM**: Custom DOM element matchers

### Deployment & Infrastructure
- **Lovable**: Integrated development and deployment platform
- **GitHub**: Version control and CI/CD integration
- **Edge Functions**: Serverless AI chat processing

## 📊 Database Schema

### Core Tables

```sql
-- User profiles with role-based access
profiles (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES auth.users,
  full_name: TEXT,
  role: user_role (admin|support|customer),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Knowledge base articles
knowledge_base (
  id: UUID PRIMARY KEY,
  title: TEXT NOT NULL,
  content: TEXT NOT NULL,
  category: TEXT,
  tags: TEXT[],
  is_published: BOOLEAN DEFAULT false,
  created_by: UUID REFERENCES profiles(id),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Support tickets
support_tickets (
  id: UUID PRIMARY KEY,
  customer_id: UUID REFERENCES profiles(id),
  assigned_to: UUID REFERENCES profiles(id),
  title: TEXT NOT NULL,
  description: TEXT NOT NULL,
  status: ticket_status DEFAULT 'open',
  priority: ticket_priority DEFAULT 'medium',
  category: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Chat conversations
chat_conversations (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES profiles(id),
  messages: JSONB[],
  status: TEXT DEFAULT 'active',
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git for version control
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd ecoscooter-support-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - The project uses Supabase with pre-configured credentials
   - No additional environment variables needed for development

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173 in your browser
   - Use demo credentials or create a new account

### Demo Accounts

- **Admin**: admin@talentica.com (auto-assigned admin role)
- **Customer**: Any other email will be assigned customer role
- **Password**: Use any password for demo accounts

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

```
src/
├── components/__tests__/
│   ├── AuthProvider.test.tsx
│   └── useUserProfile.test.tsx
├── pages/__tests__/
│   └── AdminDashboard.test.tsx
└── test/
    ├── setup.ts              # Test configuration
    └── mocks/
        └── supabase.ts        # Supabase mock utilities
```

### Testing Features

- **Component Testing**: React Testing Library for UI components
- **Hook Testing**: Custom hooks with proper mocking
- **Integration Testing**: End-to-end user workflows
- **Mock Services**: Supabase and external service mocking

## 🚀 Deployment

### Via Lovable (Recommended)

1. Open your [Lovable Project](https://lovable.dev/projects/90cd4aa2-fc14-4c30-8e49-7ee092be8d01)
2. Click **Share** → **Publish**
3. Your app will be deployed automatically with SSL

### Manual Deployment

The project can be deployed to any static hosting service:

```bash
# Build for production
npm run build

# The dist/ folder contains deployable files
```

**Deployment Options:**
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag & drop the dist/ folder or connect GitHub
- **AWS S3 + CloudFront**: Upload build files to S3 bucket
- **Self-hosted**: Use any web server (nginx, Apache)

### Custom Domain

1. Navigate to **Project** → **Settings** → **Domains** in Lovable
2. Click **Connect Domain**
3. Follow the DNS configuration instructions
4. SSL certificates are automatically provisioned

*Note: Custom domains require a paid Lovable plan*

## 📈 Features

### For Customers
- **AI Chat Support**: Get instant help with common issues
- **Knowledge Base**: Browse troubleshooting guides and FAQs
- **Support Tickets**: Create and track support requests
- **Service Status**: Check scooter availability and service updates

### For Support Staff
- **Ticket Management**: View and respond to customer inquiries
- **Knowledge Base**: Update and maintain support articles
- **Customer Insights**: Access user profiles and interaction history

### For Administrators
- **User Management**: Create accounts and manage user roles
- **Analytics Dashboard**: Monitor support performance and trends
- **Content Management**: Oversee knowledge base and support resources
- **System Configuration**: Manage offers, promotions, and system settings

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access controls
- **Role-Based Authentication**: Admin, support, and customer roles
- **Secure API Access**: All database operations require authentication
- **Input Validation**: Form validation and sanitization
- **HTTPS Encryption**: All communications encrypted in transit

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use semantic commit messages
- Maintain consistent code formatting
- Update documentation for significant changes

## 📚 Additional Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join the [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Email**: Contact the development team for enterprise support

## 📄 License

This project is developed for educational and demonstration purposes. Please ensure compliance with your organization's policies before production use.

---

**Built with ❤️ using Lovable**