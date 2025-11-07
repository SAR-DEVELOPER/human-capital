import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/identities/search
 * 
 * Proxies the search identities request to the backend API to avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }
    
    // Get all cookies from the request
    const cookies = request.cookies.toString();
    
    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/identities/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to search identities' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying search identities request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

