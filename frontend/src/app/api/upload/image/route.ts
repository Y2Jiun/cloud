import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendFormData = new FormData();
    backendFormData.append('image', image);

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: backendFormData,
    });

    const result = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
