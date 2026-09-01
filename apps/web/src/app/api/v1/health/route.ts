import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    brand: 'DEFYRA',
    version: '0.1.0',
    entity: 'MARKEET TECHNOLOGIES PRIVATE LIMITED',
    timestamp: new Date().toISOString(),
    services: {
      web: 'online',
      validationApi: 'operational',
      securityEngine: 'mock_ready',
    },
  });
}
