import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { createAssetSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { Asset } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'asset:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const assets = db.listAssetsForProject(params.id);
  return NextResponse.json({
    success: true,
    data: assets,
    error: null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'asset:create');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = createAssetSchema.safeParse({ ...rawBody, projectId: params.id });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid asset data.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { type, name, description, environment, metadata } = parseResult.data;
    const assetId = `ast_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newAsset: Asset = {
      id: assetId,
      organizationId: projectCheck.ctx.organization.id,
      projectId: params.id,
      type,
      name,
      description: description || '',
      environment,
      metadata: metadata || {},
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.createAsset(newAsset);

    await logAuditEvent({
      action: 'ASSET_CREATED',
      resourceType: 'Asset',
      resourceId: newAsset.id,
      organizationId: projectCheck.ctx.organization.id,
      userId: projectCheck.ctx.user.id,
      metadata: { name: newAsset.name, type: newAsset.type, projectId: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        data: newAsset,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to create asset.' } },
      { status: 500 }
    );
  }
}
