# Quick Start Guide - Human Capital SSO

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` if needed (defaults should work):
```env
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://hc.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Run the App
```bash
npm run dev
```

The app will run on port 3900 (configured in `package.json`).

### Step 4: Test Authentication

Visit: `http://localhost:3900/`

**Expected behavior:**
- Middleware checks for `auth_session` cookie
- If not authenticated → redirects to `https://web.centri.id/auth/login`
- After login → redirects back to your app
- Cookie is shared via `.centri.id` domain

## 📝 Use Auth in Your Components

### Get User Info
```tsx
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyPage() {
  const { user, displayName, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {displayName}!</h1>
      <p>Role: {role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Make API Calls
```tsx
import { api } from '@/lib/api';

// GET
const data = await api.get('/api/surat-tugas');

// POST
const result = await api.post('/api/surat-tugas', { title: 'New' });

// No need to manually handle tokens - it's automatic!
```

### Logout
```tsx
const handleLogout = () => {
  window.location.href = 'https://web.centri.id/auth/logout';
};
```

## 🔍 Example Pages

### View Example Component
The app includes example components showing auth usage:

1. **UserInfo Component**: `src/components/auth/UserInfo.tsx`
   - Simple user info display
   - Logout button

2. **AuthExample Component**: `src/components/auth/AuthExample.tsx`
   - Complete authentication demo
   - User info display
   - API call testing
   - Logout functionality

To use in your page:
```tsx
import AuthExample from '@/components/auth/AuthExample';

export default function TestPage() {
  return <AuthExample />;
}
```

## 🛡️ Protected Routes

Routes are protected in `lib/auth/constants.ts`:

```typescript
export const PROTECTED_PATHS = [
  "/",                  // Home page
  "/surat-tugas",       // Surat Tugas (exact)
  "/surat-tugas/*",     // All surat-tugas sub-routes
  "/employees/*",       // All employee routes
];
```

**To add new protected routes:**
Edit `lib/auth/constants.ts` and add to `PROTECTED_PATHS` array.

## 📚 Full Documentation

- **Complete Setup**: See `AUTH_SETUP.md`
- **Implementation Summary**: See `SSO_IMPLEMENTATION_SUMMARY.md`

## ❓ Troubleshooting

### "Constantly redirecting to login"
- Check cookies in browser dev tools (Application → Cookies)
- Ensure backend sets cookies with domain `.centri.id`
- Verify you're not in private/incognito mode

### "401 errors on API calls"
- Check API URL in `.env.local`
- Verify `withCredentials: true` in API client (already configured)
- Check backend CORS allows your domain

### "User info not showing"
- Ensure component has `'use client'` directive
- Check JWT token is valid (browser console)
- Try logging out and logging in again

## 🎯 Next: Deploy to Production

When ready to deploy:

1. Deploy to subdomain (e.g., `hc.centri.id`)
2. Update Keycloak redirect URIs
3. Configure backend CORS
4. Test login flow
5. Verify cross-app navigation works

---

**That's it!** Your app now has SSO authentication matching BANTAL-FE's structure. 🎉
