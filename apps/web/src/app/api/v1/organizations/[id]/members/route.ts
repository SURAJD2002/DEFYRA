import { NextRequest, NextResponse } from 'next/server';
import { requireOrgMembership } from '@/lib/auth/rbac';
import { addMemberSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgCheck = await requireOrgMembership(req, params.id, 'member:read');
  if (orgCheck.errorResponse || !orgCheck.ctx) return orgCheck.errorResponse!;

  const members = db.listMembersForOrg(params.id);
  return NextResponse.json({
    success: true,
    data: members,
    error: null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only OWNER or ADMIN can manage members
  const orgCheck = await requireOrgMembership(req, params.id, 'member:manage');
  if (orgCheck.errorResponse || !orgCheck.ctx) return orgCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = addMemberSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid member data.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, role } = parseResult.data;
    let targetUser = db.findUserByEmail(email);

    // If user doesn't exist yet, invite placeholder user
    if (!targetUser) {
      targetUser = {
        id: `usr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
        email,
        passwordHash: '',
        fullName: email.split('@')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.createUser(targetUser);
    }

    const membership = db.addMember(params.id, targetUser.id, role);

    await logAuditEvent({
      action: 'MEMBER_ADDED',
      resourceType: 'Membership',
      resourceId: membership.id,
      organizationId: params.id,
      userId: orgCheck.ctx.user.id,
      metadata: { targetUserId: targetUser.id, email, role },
    });

    const { passwordHash, ...userProfile } = targetUser;

    return NextResponse.json(
      {
        success: true,
        data: {
          membership,
          user: userProfile,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to add member.' } },
      { status: 500 }
    );
  }
}
