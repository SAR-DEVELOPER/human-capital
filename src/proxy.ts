import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_PATHS, PUBLIC_PATHS } from "../lib/auth/constants";

export function proxy(request: NextRequest) {
  // 1. Get Path Requested By User
  const path = request.nextUrl.pathname;

  console.log("Middleware called for path:", path);

  // 2. Special check: /surat-tugas/[uuid] should be public (only single UUID segment, no nested routes)
  // This matches paths like /surat-tugas/abc-123-def but not /surat-tugas/create or /surat-tugas/abc/def
  const isSuratTugasUuidRoute = path.startsWith("/surat-tugas/") &&
    path.split("/").length === 3 && // Exactly 3 segments: "", "surat-tugas", "[uuid]"
    path !== "/surat-tugas/"; // Not the exact /surat-tugas/ path

  // 3. Checking Path Protection
  const isProtectedPath = PROTECTED_PATHS.some((protectedPath) => {
    if (protectedPath.endsWith("*")) {
      return path.startsWith(protectedPath.slice(0, -1));
    }
    return path === protectedPath;
  });
  console.log("Is Protected Path?", isProtectedPath);

  // 4. Checking Public Path
  const isPublicPath = PUBLIC_PATHS.some((publicPath) => {
    if (publicPath.endsWith("*")) {
      return path.startsWith(publicPath.slice(0, -1));
    }
    return path === publicPath;
  });
  console.log("Is Public Path?", isPublicPath);

  // 5. Get Token and Check
  const token = request.cookies.get("auth_session")?.value;

  // 6. Handle routing logic
  // Check public paths first - if it's public, allow access regardless of protection
  // Also allow /surat-tugas/[uuid] routes (single UUID segment)
  if (isPublicPath || isSuratTugasUuidRoute) {
    return NextResponse.next();
  }

  if (isProtectedPath && !token) {
    // Redirect to main app login (BANTAL-FE) if trying to access protected route without token
    const loginUrl = new URL("https://web.centri.id/auth/login");

    // Construct the callback URL using the production domain instead of request.url
    // This ensures we use hc.centri.id instead of localhost:3900
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hc-sar.centri.id';
    const callbackUrl = `${appUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;

    // Store the attempted URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 7. Configure paths that trigger middleware
export const config = {
  matcher: [
    "/surat-tugas/:path*", // Match surat-tugas and all sub-routes
    "/employees/:path*", // Match employees routes if any
    "/", // Match root
  ],
};

