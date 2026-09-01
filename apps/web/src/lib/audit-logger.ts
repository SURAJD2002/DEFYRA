import { AuditEventPayload } from '@/types';

export function logAuditEventSync(event: AuditEventPayload): void {
  const payload = {
    ...event,
    id: event.id || `evt_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
    createdAt: event.createdAt || new Date().toISOString(),
  };
  console.info(`[AUDIT_LOG] ${JSON.stringify(payload)}`);
}

export async function logAuditEvent(event: AuditEventPayload): Promise<void> {
  logAuditEventSync(event);
}

export const auditLogger = {
  log: logAuditEvent,
  logSync: logAuditEventSync,
};

