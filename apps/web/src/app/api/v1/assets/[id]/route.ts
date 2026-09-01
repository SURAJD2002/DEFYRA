import { NextRequest, NextResponse } from 'next/server';
import { requireAssetAccess } from '@/lib/auth/rbac';
import { updateAssetSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assetCheck = await requireAssetAccess(req, params.id, 'asset:read');
  if (assetCheck.errorResponse || !assetCheck.ctx) return assetCheck.errorResponse!;

  const { asset, project } = assetCheck.ctx;
  const allRelationships = db.listRelationshipsForProject(project.id);

  const outgoing = allRelationships
    .filter((r) => r.sourceAssetId === asset.id)
    .map((r) => ({
      id: r.id,
      targetAssetId: r.targetAssetId,
      targetAssetName: db.findAssetById(r.targetAssetId)?.name || 'Unknown Asset',
      relationshipType: r.relationshipType,
    }));

  const incoming = allRelationships
    .filter((r) => r.targetAssetId === asset.id)
    .map((r) => ({
      id: r.id,
      sourceAssetId: r.sourceAssetId,
      sourceAssetName: db.findAssetById(r.sourceAssetId)?.name || 'Unknown Asset',
      relationshipType: r.relationshipType,
    }));

  return NextResponse.json({
    success: true,
    data: {
      ...asset,
      outgoingRelationships: outgoing,
      incomingRelationships: incoming,
    },
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assetCheck = await requireAssetAccess(req, params.id, 'asset:update');
  if (assetCheck.errorResponse || !assetCheck.ctx) return assetCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = updateAssetSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid asset updates.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updated = db.updateAsset(params.id, parseResult.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
        { status: 404 }
      );
    }

    await logAuditEvent({
      action: 'ASSET_UPDATED',
      resourceType: 'Asset',
      resourceId: updated.id,
      organizationId: assetCheck.ctx.organization.id,
      userId: assetCheck.ctx.user.id,
      metadata: parseResult.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to update asset.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assetCheck = await requireAssetAccess(req, params.id, 'asset:archive');
  if (assetCheck.errorResponse || !assetCheck.ctx) return assetCheck.errorResponse!;

  db.archiveAsset(params.id);

  await logAuditEvent({
    action: 'ASSET_ARCHIVED',
    resourceType: 'Asset',
    resourceId: params.id,
    organizationId: assetCheck.ctx.organization.id,
    userId: assetCheck.ctx.user.id,
  });

  return NextResponse.json({
    success: true,
    data: { message: 'Asset archived successfully.' },
    error: null,
  });
}
