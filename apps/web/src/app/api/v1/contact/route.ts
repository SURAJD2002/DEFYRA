import { NextRequest, NextResponse } from 'next/server';
import { contactSubmissionSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit-logger';
import { sanitizeInput } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const requestId = `req_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    // 1. IP & Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimit = checkRateLimit(`contact:${ip}`, 5, 600000); // 5 requests per 10 minutes

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'RATE_LIMITED',
            message: `Too many submissions. Please wait ${rateLimit.resetInSec} seconds before submitting again.`,
          },
          meta: { requestId, timestamp },
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const rawBody = await req.json();
    const parseResult = contactSubmissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid submission data',
            details: parseResult.error.flatten().fieldErrors,
          },
          meta: { requestId, timestamp },
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 3. Sanitize inputs
    const sanitizedRecord = {
      name: sanitizeInput(data.name),
      workEmail: sanitizeInput(data.workEmail.toLowerCase()),
      company: sanitizeInput(data.company),
      role: sanitizeInput(data.role),
      companySize: data.companySize,
      aiSystemType: sanitizeInput(data.aiSystemType),
      scopeDescription: sanitizeInput(data.scopeDescription),
      message: sanitizeInput(data.message || ''),
      submittedAt: timestamp,
    };

    const referenceId = `DEF-INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Record Audit Event
    await logAuditEvent({
      action: 'CONTACT_SUBMISSION_CREATED',
      resourceType: 'Inquiry',
      resourceId: referenceId,
      metadata: {
        company: sanitizedRecord.company,
        aiSystemType: sanitizedRecord.aiSystemType,
        workEmailDomain: sanitizedRecord.workEmail.split('@')[1],
        requestId,
      },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          referenceId,
          status: 'RECEIVED',
          message: 'Your assessment request has been recorded. The security engineering team will review scope under mutual NDA.',
        },
        error: null,
        meta: { requestId, timestamp },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[API_ERROR] ${requestId}:`, error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred while processing the request.',
        },
        meta: { requestId, timestamp },
      },
      { status: 500 }
    );
  }
}
