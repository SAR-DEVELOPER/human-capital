import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/auth/refresh
 * 
 * Proxies the token refresh request to the backend API to avoid CORS issues.
 */
export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    
    // Get all cookies from the request
    const cookies = request.cookies.toString();
    
    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
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
        errorData = { error: errorText || 'Failed to refresh token' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Return the response data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying refresh request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

