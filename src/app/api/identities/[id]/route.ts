import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/identities/[id]
 * 
 * Proxies the get identity by ID request to the backend API to avoid CORS issues.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Get all cookies from the request
    const cookies = request.cookies.toString();
    
    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/identities/${id}`, {
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
        errorData = { error: errorText || 'Failed to fetch identity' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying identity by ID request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

