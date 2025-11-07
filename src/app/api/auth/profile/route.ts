import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/auth/profile
 * 
 * Proxies the profile request to the backend API to avoid CORS issues.
 * The backend API expects the auth_session cookie to be forwarded.
 */
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    
    // Get all cookies from the request
    const cookies = request.cookies.toString();
    
    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward all cookies from the original request
        ...(cookies && { 'Cookie': cookies }),
      },
    });

    if (!response.ok) {
      // Return error response with status code
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to fetch profile' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Return the profile data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying profile request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

