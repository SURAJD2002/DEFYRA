import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken } from './session';
import { db } from '@/lib/store';
import { User, Organization, Membership, Project, Asset, UserRole } from '@/types';

export type Action =
  | 'org:read'
  | 'org:update'
  | 'org:delete'
  | 'member:read'
  | 'member:manage'
  | 'project:read'
  | 'project:create'
  | 'project:update'
  | 'project:archive'
  | 'asset:read'
  | 'asset:create'
  | 'asset:update'
  | 'asset:archive'
  | 'test:read'
  | 'test:execute'
  | 'finding:read'
  | 'finding:manage'
  | 'report:read'
  | 'report:generate';

const ROLE_PERMISSIONS: Record<UserRole, Set<Action>> = {
  OWNER: new Set([
    'org:read',
    'org:update',
    'org:delete',
    'member:read',
    'member:manage',
    'project:read',
    'project:create',
    'project:update',
    'project:archive',
    'asset:read',
    'asset:create',
    'asset:update',
    'asset:archive',
    'test:read',
    'test:execute',
    'finding:read',
    'finding:manage',
    'report:read',
    'report:generate',
  ]),
  ADMIN: new Set([
    'org:read',
    'org:update',
    'member:read',
    'member:manage',
    'project:read',
    'project:create',
    'project:update',
    'project:archive',
    'asset:read',
    'asset:create',
    'asset:update',
    'asset:archive',
    'test:read',
    'finding:read',
    'finding:manage',
    'report:read',
  ]),
  SECURITY_LEAD: new Set([
    'org:read',
    'member:read',
    'project:read',
    'project:create',
    'project:update',
    'asset:read',
    'asset:create',
    'asset:update',
    'test:read',
    'test:execute',
    'finding:read',
    'finding:manage',
    'report:read',
    'report:generate',
  ]),
  ANALYST: new Set([
    'org:read',
    'member:read',
    'project:read',
    'asset:read',
    'test:read',
    'finding:read',
    'finding:manage',
    'report:read',
  ]),
  VIEWER: new Set([
    'org:read',
    'member:read',
    'project:read',
    'asset:read',
    'test:read',
    'finding:read',
    'report:read',
  ]),
};

export function hasPermission(role: UserRole, action: Action): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.has(action) : false;
}

export interface AuthContext {
  user: User;
  sessionToken: string;
}

export interface OrgContext extends AuthContext {
  organization: Organization;
  membership: Membership;
}

export interface ProjectContext extends OrgContext {
  project: Project;
}

export interface AssetContext extends ProjectContext {
  asset: Asset;
}

/**
 * 1. Verifies that the incoming request has a valid active session.
 */
export async function requireAuth(req: NextRequest): Promise<{ ctx?: AuthContext; errorResponse?: NextResponse }> {
  const token = extractSessionToken(req);
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required. No active session found.' },
        },
        { status: 401 }
      ),
    };
  }

  const session = db.findSessionByToken(token);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'UNAUTHORIZED', message: 'Session expired or invalidated. Please log in again.' },
        },
        { status: 401 }
      ),
    };
  }

  const user = db.findUserById(session.userId);
  if (!user || user.status !== 'active') {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'FORBIDDEN', message: 'Account is disabled or unavailable.' },
        },
        { status: 403 }
      ),
    };
  }

  return { ctx: { user, sessionToken: token } };
}

/**
 * 2. Verifies that the authenticated user is an active member of the specified organization.
 */
export async function requireOrgMembership(
  req: NextRequest,
  organizationId: string,
  requiredAction?: Action
): Promise<{ ctx?: OrgContext; errorResponse?: NextResponse }> {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return { errorResponse: auth.errorResponse };

  const org = db.findOrganizationById(organizationId);
  if (!org || org.status === 'archived') {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: 'Organization not found.' },
        },
        { status: 404 }
      ),
    };
  }

  const membership = db.findMembership(org.id, auth.ctx.user.id);
  if (!membership) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this organization.' },
        },
        { status: 403 }
      ),
    };
  }

  if (requiredAction && !hasPermission(membership.role, requiredAction)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'FORBIDDEN',
            message: `Insufficient permissions. Role ${membership.role} cannot perform action '${requiredAction}'.`,
          },
        },
        { status: 403 }
      ),
    };
  }

  return {
    ctx: {
      ...auth.ctx,
      organization: org,
      membership,
    },
  };
}

/**
 * 3. Verifies project access through organization membership.
 */
export async function requireProjectAccess(
  req: NextRequest,
  projectId: string,
  requiredAction?: Action
): Promise<{ ctx?: ProjectContext; errorResponse?: NextResponse }> {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return { errorResponse: auth.errorResponse };

  const project = db.findProjectById(projectId);
  if (!project || project.status === 'archived') {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: 'Project not found.' },
        },
        { status: 404 }
      ),
    };
  }

  // Derive organization membership from the project's organization_id
  const orgCheck = await requireOrgMembership(req, project.organizationId, requiredAction);
  if (orgCheck.errorResponse || !orgCheck.ctx) return { errorResponse: orgCheck.errorResponse };

  return {
    ctx: {
      ...orgCheck.ctx,
      project,
    },
  };
}

/**
 * 4. Verifies asset access through project & organization membership.
 */
export async function requireAssetAccess(
  req: NextRequest,
  assetId: string,
  requiredAction?: Action
): Promise<{ ctx?: AssetContext; errorResponse?: NextResponse }> {
  const asset = db.findAssetById(assetId);
  if (!asset || asset.status === 'archived') {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: 'Asset not found.' },
        },
        { status: 404 }
      ),
    };
  }

  const projectCheck = await requireProjectAccess(req, asset.projectId, requiredAction);
  if (projectCheck.errorResponse || !projectCheck.ctx) return { errorResponse: projectCheck.errorResponse };

  return {
    ctx: {
      ...projectCheck.ctx,
      asset,
    },
  };
}
