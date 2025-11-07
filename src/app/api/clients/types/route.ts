import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/clients/types
 * 
 * Proxies the client types request to the backend API to avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    const cookies = request.cookies.toString();
    
    const response = await fetch(`${apiUrl}/clients/types`, {
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
        errorData = { error: errorText || 'Failed to fetch client types' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying client types request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

