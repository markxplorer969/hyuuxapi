import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyValidation } from '@/middleware/apiKeyValidator';

// Example protected API route
export const GET = withApiKeyValidation(async (request: NextRequest) => {
  // Get user info from headers added by middleware
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  // Your API logic here
  const data = {
    message: 'This is a protected API endpoint',
    user: {
      id: userId,
      role: userRole
    },
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(data);
});

export const POST = withApiKeyValidation(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Process the request based on user role
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Your POST logic here
    const result = {
      success: true,
      message: 'Data processed successfully',
      receivedData: body,
      user: {
        id: userId,
        role: userRole
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
});