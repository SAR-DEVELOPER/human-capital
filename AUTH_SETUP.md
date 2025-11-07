# Authentication Setup for Human Capital App

This document explains how authentication works in the Human Capital application.

## Overview

The Human Capital app uses **Shared Cookie SSO** with the main BANTAL application. This means:

- ✅ Single Sign-On across all SAR applications
- ✅ Users log in once and access all modules
- ✅ Centralized authentication through Keycloak + Microsoft Entra ID
- ✅ Secure HTTP-only cookies shared across subdomains

## Architecture

```
User → human-capital app → Middleware checks auth_session cookie
         ↓ (if not authenticated)
         Redirect to web.centri.id/auth/login
         ↓ (user logs in)
         Backend sets cookies on .centri.id domain
         ↓ (cookies shared)
         Redirect back to human-capital app
         ↓ (middleware sees cookie)
         Access granted ✓
```

## File Structure

```
human-capital/
├── middleware.ts                    # Route protection (checks auth_session cookie)
├── lib/
│   ├── auth/
│   │   ├── constants.ts            # Auth constants (paths, cookie names)
│   │   ├── client.ts               # Client-side auth utilities
│   │   ├── keycloak.ts             # Keycloak configuration
│   │   └── types.ts                # TypeScript types
│   ├── api/
│   │   ├── axios.ts                # Axios instance configuration
│   │   ├── interceptors.ts         # Request/response interceptors
│   │   └── index.ts                # Main API export
│   └── hooks/
│       └── useAuth.ts              # React hook for auth state
└── .env.example                    # Environment variables template
```

## How It Works

### 1. Middleware Protection

File: `middleware.ts`

- Runs on every request to protected routes
- Checks for `auth_session` cookie
- If missing, redirects to main app login: `https://web.centri.id/auth/login`
- Includes callback URL to redirect back after login

Protected paths:
- `/` (home)
- `/surat-tugas/*`
- `/employees/*`

### 2. Cookie Sharing

Cookies are set by the backend on domain `.centri.id`:

```typescript
Domain: .centri.id  // Parent domain (shares to all subdomains)
Cookies:
  - auth_session (15 min)
  - refresh_token (24 hours)
```

This allows:
- `web.centri.id` (main app)
- `hc.centri.id` (human capital)
- `api.centri.id` (backend)

To all see the same cookies.

### 3. API Client with Auto-Refresh

File: `lib/api/interceptors.ts`

The API client automatically:
1. Includes cookies in requests (`withCredentials: true`)
2. Detects 401 (Unauthorized) responses
3. Calls `/auth/refresh` to get new access token
4. Retries the original request
5. If refresh fails, redirects to login

Usage in components:

```typescript
import { api } from '@/lib/api';

// API calls automatically include auth cookies
const response = await api.get('/surat-tugas');
```

### 4. Client-Side User Info

File: `lib/hooks/useAuth.ts`

React hook to access user information in components:

```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, displayName, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return <div>Welcome, {displayName}!</div>;
}
```

User data comes from JWT token decoded client-side (for display only).

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://hc.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id
```

## Login Flow

### First-time user visits `/surat-tugas`:

1. **Middleware runs**: No `auth_session` cookie found
2. **Redirect**: User sent to `https://web.centri.id/auth/login?callbackUrl=https://hc.centri.id/surat-tugas`
3. **Main app login page**: Displays Keycloak login
4. **User logs in**: Via Microsoft Entra ID → Keycloak → Backend
5. **Backend sets cookies**: On `.centri.id` domain
6. **Redirect back**: User returns to `https://hc.centri.id/surat-tugas`
7. **Middleware runs again**: `auth_session` cookie present ✓
8. **Access granted**: Page loads

### Subsequent visits:

1. **Middleware runs**: Cookie already exists ✓
2. **Page loads immediately**: No redirect needed

## API Integration

### Making authenticated API calls:

```typescript
import { api } from '@/lib/api';

// GET request
const response = await api.get('/api/surat-tugas');

// POST request
const newSuratTugas = await api.post('/api/surat-tugas', {
  title: 'New Assignment',
  // ...
});

// Cookies automatically included, no manual token handling needed
```

### Token refresh is automatic:

The interceptor handles token expiration transparently:

```typescript
// Your code:
const data = await api.get('/api/protected-resource');

// Behind the scenes if token expired:
// 1. Request fails with 401
// 2. Interceptor calls /auth/refresh
// 3. New token received via cookie
// 4. Original request retried
// 5. Data returned to your code
```

## Logout

To log out, redirect to the main app logout:

```typescript
// In your component
const handleLogout = () => {
  window.location.href = 'https://web.centri.id/auth/logout';
};
```

This will:
1. Clear cookies on backend
2. Invalidate Keycloak session
3. Redirect to login page

## Security Notes

✅ **HTTP-only cookies**: JavaScript cannot access tokens (XSS protection)
✅ **Secure flag**: Cookies only sent over HTTPS
✅ **SameSite=none**: Allows cross-subdomain sharing
✅ **Domain scoping**: Cookies only shared within `.centri.id`
✅ **Token expiration**: 15-minute access tokens, 24-hour refresh tokens
✅ **Enhanced JWT validation**: Backend checks internal identity database

⚠️ **Important**: All subdomains under `.centri.id` must be trusted, as they can access shared cookies.

## Troubleshooting

### "Redirecting to login constantly"

- Check cookie domain is set to `.centri.id` (note the leading dot)
- Verify you're accessing via correct subdomain (e.g., `hc.centri.id`)
- Check browser console for cookie issues
- Ensure backend CORS allows your subdomain

### "401 Unauthorized on API calls"

- Check `withCredentials: true` is set in API client
- Verify API URL is `https://api.centri.id`
- Check backend allows credentials from your origin
- Look for CORS errors in browser console

### "User data not showing"

- Ensure JWT token is valid (check `/auth/profile` endpoint)
- Verify `useAuth` hook is called in client component (has `'use client'` directive)
- Check browser dev tools → Application → Cookies for `auth_session`

## Adding New Protected Routes

Edit `lib/auth/constants.ts`:

```typescript
export const PROTECTED_PATHS = [
  "/",
  "/surat-tugas",
  "/surat-tugas/*",
  "/employees/*",
  "/your-new-route/*",  // Add here
];
```

Middleware will automatically protect the new routes.

## Development vs Production

### Development (localhost):

Cookie sharing doesn't work across different ports on localhost. Options:

1. **Use main app for auth**: Always redirect to deployed main app for login
2. **Mock auth in dev**: Temporarily disable middleware for local development
3. **Use hosts file**: Map `local.centri.id` domains to 127.0.0.1

### Production:

Cookie sharing works automatically across subdomains:
- `web.centri.id`
- `hc.centri.id`
- `finance.centri.id` (future)
- etc.

## Next Steps

To deploy this app with SSO:

1. ✅ Copy `.env.example` to `.env.local` and configure
2. ✅ Deploy app to subdomain (e.g., `hc.centri.id`)
3. ✅ Update Keycloak valid redirect URIs to include your subdomain
4. ✅ Configure backend CORS to allow your subdomain
5. ✅ Test login flow from your app
6. ✅ Verify cookie sharing works
7. ✅ Test cross-app navigation

## Questions?

Refer to the main BANTAL-FE app for reference implementation or contact the development team.
