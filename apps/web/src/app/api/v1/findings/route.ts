import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { db } from '@/lib/store';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return auth.errorResponse!;

  const userOrgs = db.listOrganizationsForUser(auth.ctx.user.id);
  if (userOrgs.length === 0) {
    return NextResponse.json({ success: true, data: [], error: null });
  }

  const orgId = userOrgs[0].org.id;
  const findings = db.listFindingsForOrg(orgId);

  return NextResponse.json({
    success: true,
    data: findings,
    error: null,
  });
}
