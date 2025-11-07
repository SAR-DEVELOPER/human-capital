import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/clients/[id]
 * 
 * Proxies client requests (GET, PUT, DELETE) to the backend API to avoid CORS issues.
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
    
    const cookies = request.cookies.toString();
    
    const response = await fetch(`${apiUrl}/clients/${id}`, {
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
        errorData = { error: errorText || 'Failed to fetch client' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying get client request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    const { id } = await params;
    const body = await request.json();
    const cookies = request.cookies.toString();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${apiUrl}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to update client' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying update client request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';
    const { id } = await params;
    const cookies = request.cookies.toString();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${apiUrl}/clients/${id}`, {
      method: 'DELETE',
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
        errorData = { error: errorText || 'Failed to delete client' };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    // DELETE might return empty body
    if (response.status === 204 || response.status === 200) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error proxying delete client request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

