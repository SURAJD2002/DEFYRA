import { AuditEventPayload } from '@/types';

export async function logAuditEvent(event: AuditEventPayload): Promise<void> {
  const payload = {
    ...event,
    id: event.id || `evt_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
    createdAt: event.createdAt || new Date().toISOString(),
  };

  // Structured audit event logging to stdout / audit sinks
  // Production will pipe directly to immutable database/S3 stream
  console.info(`[AUDIT_LOG] ${JSON.stringify(payload)}`);
}
