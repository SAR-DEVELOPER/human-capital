# Human Capital Management System

A modern Human Capital Management (HCM) application built with Next.js, featuring Single Sign-On (SSO) authentication and comprehensive HR management capabilities.

## 🚀 Features

- **🔐 Single Sign-On (SSO)** - Seamless authentication across all SAR applications using shared cookie-based SSO
- **📝 Surat Tugas Management** - Complete workflow for creating, managing, and tracking assignment letters
- **📄 Document Generation** - Generate Word documents from templates with dynamic data
- **🔲 QR Code Integration** - Generate QR codes for document verification
- **👥 Employee Management** - Manage employee profiles and organizational data
- **🎨 Modern UI** - Built with Material-UI (MUI) and Framer Motion for smooth animations
- **🔒 Secure API Integration** - Automatic token refresh and credential management

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI Library**: [Material-UI (MUI) v6](https://mui.com/)
- **Styling**: Emotion (CSS-in-JS)
- **HTTP Client**: Axios
- **Document Generation**: docxtemplater
- **QR Code**: qrcode
- **Animations**: Framer Motion
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- Access to the BANTAL API backend
- Keycloak authentication setup (for SSO)

## 🏃 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd human-capital
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://hc.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id
```

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3900](http://localhost:3900)

### 5. Build for production

```bash
npm run build
npm start
```

## 🔐 Authentication

This application uses **Shared Cookie SSO** with the main BANTAL application. Users authenticate once and can access all modules seamlessly.

### How it works:

1. User visits a protected route
2. Middleware checks for `auth_session` cookie
3. If not authenticated, redirects to main app login
4. After login, cookies are set on `.centri.id` domain
5. User is redirected back with access granted

### Using authentication in components:

```tsx
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyPage() {
  const { user, displayName, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {displayName}!</div>;
}
```

### Making authenticated API calls:

```tsx
import { api } from '@/lib/api';

// GET request
const data = await api.get('/api/surat-tugas');

// POST request
const result = await api.post('/api/surat-tugas', { 
  title: 'New Assignment',
  // ... other fields
});
```

For detailed authentication setup, see [AUTH_SETUP.md](./AUTH_SETUP.md)

## 📁 Project Structure

```
human-capital/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── surat-tugas/       # Surat Tugas pages
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # UI components
│   └── modules/               # Feature modules
├── lib/
│   ├── api/                   # API client configuration
│   ├── auth/                  # Authentication utilities
│   ├── hooks/                 # Custom React hooks
│   └── utils/                 # Utility functions
├── public/
│   └── templates/             # Document templates
├── middleware.ts              # Route protection middleware
└── next.config.ts             # Next.js configuration
```

## 🎯 Available Modules

### ✅ Implemented

- **Surat Tugas** - Assignment letter management with document generation and QR codes

### 🚧 Planned

- Employee Management
- Recruitment
- Performance Management
- Training & Development
- Payroll Management
- Attendance & Leave
- Employee Self-Service
- HR Analytics
- Career Development
- Benefits Administration
- Team Management
- HR Settings

## 📚 Documentation

- [AUTH_SETUP.md](./AUTH_SETUP.md) - Complete authentication documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [SSO_IMPLEMENTATION_SUMMARY.md](./SSO_IMPLEMENTATION_SUMMARY.md) - SSO implementation details

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 3900)
- `npm run build` - Build for production
- `npm start` - Start production server (port 3900)

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.centri.id` |
| `NEXT_PUBLIC_APP_URL` | This application's URL | `https://hc.centri.id` |
| `NEXT_PUBLIC_MAIN_APP_URL` | Main BANTAL app URL | `https://web.centri.id` |

## 🐳 Docker Support

A `docker-compose.yml` file is included for containerized deployment. See the file for configuration details.

## 🔒 Security

- HTTP-only cookies for token storage (XSS protection)
- Secure flag for HTTPS-only transmission
- SameSite cookie policy for cross-subdomain sharing
- Automatic token refresh on expiration
- Enhanced JWT validation on backend

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Constantly redirecting to login
- Check cookies in browser dev tools (Application → Cookies)
- Ensure backend sets cookies with domain `.centri.id`
- Verify you're not in private/incognito mode

### 401 errors on API calls
- Check API URL in `.env.local`
- Verify `withCredentials: true` in API client
- Check backend CORS allows your domain

### User info not showing
- Ensure component has `'use client'` directive
- Check JWT token is valid
- Try logging out and logging in again

## 📞 Support

For issues and questions, please contact the development team or refer to the main BANTAL-FE application for reference implementation.

---

Built with ❤️ using Next.js and Material-UI
