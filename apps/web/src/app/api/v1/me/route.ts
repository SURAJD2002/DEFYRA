import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { db } from '@/lib/store';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) {
    return auth.errorResponse!;
  }

  const { user } = auth.ctx;
  const userOrgs = db.listOrganizationsForUser(user.id);
  const primaryOrg = userOrgs[0]?.org;
  const primaryRole = userOrgs[0]?.role || 'VIEWER';

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        createdAt: user.createdAt,
      },
      organizations: userOrgs,
      activeOrganization: primaryOrg,
      role: primaryRole,
    },
    error: null,
  });
}
