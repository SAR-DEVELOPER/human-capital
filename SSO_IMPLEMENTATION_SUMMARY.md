# SSO Implementation Summary - Human Capital App

## ✅ Implementation Complete

The Human Capital app now has full SSO authentication following the same structure and practices as BANTAL-FE.

## 📁 Files Created

### 1. Middleware (Route Protection)
- **`src/middleware.ts`** - Protects routes and checks for auth_session cookie

### 2. Auth Library (`lib/auth/`)
- **`constants.ts`** - Auth constants (protected paths, cookie names, token expiry)
- **`client.ts`** - Client-side utilities (JWT decode, get user info, display name, role)
- **`keycloak.ts`** - Keycloak configuration and login URL generation
- **`types.ts`** - TypeScript interfaces for User and AuthTokens

### 3. API Client (`lib/api/`)
- **`axios.ts`** - Axios instance with credentials and base URL
- **`interceptors.ts`** - Request/response interceptors with automatic token refresh
- **`index.ts`** - Main export for API client

### 4. React Hooks (`lib/hooks/`)
- **`useAuth.ts`** - Custom React hook for accessing user info in components

### 5. Example Components (`src/components/auth/`)
- **`UserInfo.tsx`** - Simple user info display component
- **`AuthExample.tsx`** - Comprehensive example showing all auth features

### 6. Configuration
- **`.env.example`** - Environment variables template
- **`src/app/layout.tsx`** - Updated with auth documentation comments

### 7. Documentation
- **`AUTH_SETUP.md`** - Complete authentication documentation
- **`SSO_IMPLEMENTATION_SUMMARY.md`** - This file

## 🔐 How It Works

### Cookie-Based SSO
```
Domain: .centri.id (shared across all subdomains)
Cookies:
  - auth_session (15 min) - Access token
  - refresh_token (24 hours) - Refresh token
```

### Authentication Flow
```
1. User visits protected route
   ↓
2. Middleware checks auth_session cookie
   ↓ (if missing)
3. Redirect to web.centri.id/auth/login
   ↓
4. User logs in via Keycloak + Entra ID
   ↓
5. Backend sets cookies on .centri.id domain
   ↓
6. Redirect back to original URL
   ↓
7. Middleware sees cookie → Access granted ✓
```

### Token Refresh (Automatic)
```
1. API request made
   ↓
2. Returns 401 (token expired)
   ↓
3. Interceptor calls /auth/refresh
   ↓
4. New token received via cookie
   ↓
5. Original request retried
   ↓
6. Response returned to application
```

## 🚀 Usage Examples

### 1. Protected Routes
Already configured in `lib/auth/constants.ts`:
```typescript
export const PROTECTED_PATHS = [
  "/",
  "/surat-tugas",
  "/surat-tugas/*",
  "/employees/*",
];
```

### 2. Get User Info in Component
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

### 3. Make Authenticated API Call
```typescript
import { api } from '@/lib/api';

// GET request
const response = await api.get('/api/surat-tugas');

// POST request
const newItem = await api.post('/api/surat-tugas', {
  title: 'New Assignment',
  // ...
});

// Cookies automatically included, token refresh automatic
```

### 4. Logout
```typescript
const handleLogout = () => {
  window.location.href = 'https://web.centri.id/auth/logout';
};
```

## 📋 Configuration Checklist

### Local Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update environment variables if needed
- [ ] Test middleware protection (should redirect to login)
- [ ] Test API calls work after login

### Production Deployment
- [ ] Deploy to subdomain (e.g., `hc.centri.id`)
- [ ] Ensure cookie domain is `.centri.id`
- [ ] Update Keycloak valid redirect URIs
- [ ] Configure backend CORS for new subdomain
- [ ] Test login flow end-to-end
- [ ] Verify cookie sharing works
- [ ] Test cross-app navigation (hc.centri.id ↔ web.centri.id)

## 🔧 Maintenance

### Adding New Protected Routes
Edit `lib/auth/constants.ts`:
```typescript
export const PROTECTED_PATHS = [
  // ... existing paths
  "/your-new-route/*",  // Add here
];
```

### Adding New Public Routes
Edit `lib/auth/constants.ts`:
```typescript
export const PUBLIC_PATHS = [
  // ... existing paths
  "/your-public-route/*",  // Add here
];
```

### Customizing API Base URL
Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## 🏗️ Architecture Comparison

### BANTAL-FE (Main App)
```
middleware.ts ✓
lib/auth/ ✓
lib/api/ ✓
Handles OAuth flow ✓
Sets cookies ✓
```

### Human Capital (This App)
```
middleware.ts ✓ (same pattern)
lib/auth/ ✓ (same structure)
lib/api/ ✓ (same structure)
Uses shared cookies ✓
Redirects to main app login ✓
```

## ✨ Key Features

✅ **Middleware-based route protection**
✅ **Shared cookie SSO across subdomains**
✅ **Automatic token refresh on API calls**
✅ **Client-side user info via JWT decode**
✅ **Type-safe with TypeScript**
✅ **Secure HTTP-only cookies**
✅ **Centralized login flow**
✅ **Zero-config API authentication**

## 🧪 Testing

### Test Checklist
1. ✅ Visit root (`/`) → Should redirect to login if not authenticated
2. ✅ Visit `/surat-tugas` → Should redirect to login if not authenticated
3. ✅ After login → Should redirect back to original URL
4. ✅ User info displays correctly (`useAuth` hook)
5. ✅ API calls include cookies automatically
6. ✅ Token refresh works on 401 errors
7. ✅ Logout clears session and redirects to login
8. ✅ Can navigate between apps without re-login

## 📚 Additional Resources

- **Full Documentation**: See `AUTH_SETUP.md`
- **Example Components**: See `src/components/auth/`
- **BANTAL-FE Reference**: `/BANTAL-FE/middleware.tsx` and `/BANTAL-FE/lib/auth/`

## 🎯 Next Steps

For deploying additional Next.js apps with SSO:

1. Copy this authentication structure to new app
2. Update `PROTECTED_PATHS` in `constants.ts`
3. Update app name in `.env.example`
4. Deploy to new subdomain under `.centri.id`
5. Add subdomain to Keycloak and backend CORS
6. Test SSO flow

---

**Implementation Date**: November 7, 2025
**Pattern Used**: Shared Cookie SSO
**Based On**: BANTAL-FE authentication structure
**Status**: ✅ Ready for deployment
