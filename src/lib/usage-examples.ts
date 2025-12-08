// Example usage of the daily usage tracking and regenerate functionality

// 1. Update daily usage (typically called after an API request)
async function trackApiUsage(userId: string, apiKeyId: string, usageCount: number = 1) {
  try {
    const response = await fetch('/api/daily-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        apiKeyId: apiKeyId,
        usage: usageCount
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to track usage');
    }

    return data.data;
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

// 2. Get current daily usage
async function getCurrentUsage(userId: string) {
  try {
    const response = await fetch(`/api/daily-usage?userId=${userId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get usage');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting usage:', error);
    throw error;
  }
}

// 3. Regenerate API key
async function regenerateApiKey(userId: string, keyId: string) {
  try {
    const response = await fetch('/api/regenerate-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        keyId: keyId
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to regenerate API key');
    }

    return data.data;
  } catch (error) {
    console.error('Error regenerating API key:', error);
    throw error;
  }
}

// Example integration in an API middleware
export async function middleware(request: Request) {
  // Extract user info from authentication
  const userId = request.headers.get('x-user-id');
  const apiKeyId = request.headers.get('x-api-key-id');
  
  if (userId && apiKeyId) {
    try {
      // Track the usage
      await trackApiUsage(userId, apiKeyId);
    } catch (error) {
      // Log error but don't block the request
      console.error('Failed to track usage:', error);
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}