import { prisma } from './prisma';

// Audit event types for type safety
export const AUDIT_EVENTS = {
  RESERVATION_CREATED: 'reservation_created',
  RESERVATION_UPDATED: 'reservation_updated',
  RESERVATION_EMAIL_SENT: 'reservation_email_sent',
  RESERVATION_EMAIL_FAILED: 'reservation_email_failed',
  RESERVATION_EXPORTED: 'reservation_exported',
  CALL_LOG_WRITTEN: 'call_log_written',
  CALL_LOG_WRITE_FAILED: 'call_log_write_failed',
} as const;

type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

// Interface for audit log metadata
export interface AuditMetadata {
  recipientEmail?: string;
  ccEmails?: string[];
  fieldsChanged?: string[];
  errorMessage?: string;
  emailSubject?: string;
  exportFormat?: string;
  [key: string]: any;
}

/**
 * Creates an audit log entry for tracking user actions
 * 
 * This function is designed to be non-blocking - audit logging failures should never
 * impact the user experience or prevent the primary action from completing.
 * 
 * @param eventType - The type of event being logged
 * @param reservationId - Optional reservation ID associated with the event
 * @param userId - ID of the user performing the action
 * @param userEmail - Email of the user performing the action
 * @param metadata - Additional context about the event (recipient emails, fields changed, errors, etc.)
 */
export async function createAuditLog(
  eventType: AuditEventType,
  reservationId: number | null,
  userId: number,
  userEmail: string,
  metadata?: AuditMetadata
): Promise<void> {
  try {
    // Convert metadata to JSON string for storage
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    await prisma.auditLog.create({
      data: {
        eventType,
        reservationId,
        userId,
        userEmail,
        metadata: metadataJson,
      },
    });
  } catch (error) {
    // IMPORTANT: Audit logging failures should never block user actions
    // Log the error but don't throw it to prevent impacting the user experience
    console.error('Failed to create audit log:', {
      eventType,
      reservationId,
      userId,
      userEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Creates an audit log entry for reservation creation
 * 
 * @param reservationId - ID of the created reservation
 * @param userId - ID of the user who created the reservation
 * @param userEmail - Email of the user who created the reservation
 * @param reservationData - Key details about the created reservation
 */
export async function logReservationCreated(
  reservationId: number,
  userId: number,
  userEmail: string,
  reservationData: {
    companyName: string;
    dealName: string;
    profileType: string;
    callType: string;
  }
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.RESERVATION_CREATED,
    reservationId,
    userId,
    userEmail,
    {
      companyName: reservationData.companyName,
      dealName: reservationData.dealName,
      profileType: reservationData.profileType,
      callType: reservationData.callType,
    }
  );
}

/**
 * Creates an audit log entry for reservation updates
 * 
 * @param reservationId - ID of the updated reservation
 * @param userId - ID of the user who updated the reservation
 * @param userEmail - Email of the user who updated the reservation
 * @param fieldsChanged - Array of field names that were changed
 * @param oldValues - Previous values before the update
 * @param newValues - New values after the update
 */
export async function logReservationUpdated(
  reservationId: number,
  userId: number,
  userEmail: string,
  fieldsChanged: string[],
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.RESERVATION_UPDATED,
    reservationId,
    userId,
    userEmail,
    {
      fieldsChanged,
      oldValues,
      newValues,
    }
  );
}

/**
 * Creates an audit log entry for successful email sending
 * 
 * @param reservationId - ID of the reservation the email was sent for
 * @param userId - ID of the user who sent the email
 * @param userEmail - Email of the user who sent the email
 * @param recipientEmail - Primary recipient email address
 * @param ccEmails - Array of CC email addresses
 * @param subject - Email subject line
 */
export async function logEmailSent(
  reservationId: number,
  userId: number,
  userEmail: string,
  recipientEmail: string,
  ccEmails: string[] = [],
  subject?: string
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.RESERVATION_EMAIL_SENT,
    reservationId,
    userId,
    userEmail,
    {
      recipientEmail,
      ccEmails,
      emailSubject: subject,
    }
  );
}

/**
 * Creates an audit log entry for failed email sending
 * 
 * @param reservationId - ID of the reservation the email failed to send for
 * @param userId - ID of the user who attempted to send the email
 * @param userEmail - Email of the user who attempted to send the email
 * @param recipientEmail - Primary recipient email address
 * @param ccEmails - Array of CC email addresses
 * @param errorMessage - Error message describing why the email failed
 * @param subject - Email subject line
 */
export async function logEmailFailed(
  reservationId: number,
  userId: number,
  userEmail: string,
  recipientEmail: string,
  ccEmails: string[] = [],
  errorMessage: string,
  subject?: string
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.RESERVATION_EMAIL_FAILED,
    reservationId,
    userId,
    userEmail,
    {
      recipientEmail,
      ccEmails,
      errorMessage,
      emailSubject: subject,
    }
  );
}

/**
 * Creates an audit log entry for reservation export actions
 * 
 * @param userId - ID of the user who performed the export
 * @param userEmail - Email of the user who performed the export
 * @param exportFormat - Format of the export (CSV, PDF, etc.)
 * @param filterCriteria - Any filters applied to the export
 */
export async function logReservationExported(
  userId: number,
  userEmail: string,
  exportFormat: string,
  filterCriteria?: Record<string, any>
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.RESERVATION_EXPORTED,
    null, // Export actions may not be tied to a specific reservation
    userId,
    userEmail,
    {
      exportFormat,
      filterCriteria,
    }
  );
}

/**
 * Creates an audit log entry for successful Call Log writes
 * 
 * @param reservationId - ID of the reservation written to Call Log
 * @param userId - ID of the user who triggered the action
 * @param userEmail - Email of the user who triggered the action
 * @param sheetName - Name of the sheet tab where the entry was written
 */
export async function logCallLogWritten(
  reservationId: number,
  userId: number,
  userEmail: string,
  sheetName: string
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.CALL_LOG_WRITTEN,
    reservationId,
    userId,
    userEmail,
    {
      sheetName,
      action: 'call_log_written'
    }
  );
}

/**
 * Creates an audit log entry for failed Call Log writes
 * 
 * @param reservationId - ID of the reservation that failed to write to Call Log
 * @param userId - ID of the user who triggered the action
 * @param userEmail - Email of the user who triggered the action
 * @param reason - Reason for the failure (auth_expired, permission_denied, sheet_missing)
 * @param errorMessage - Detailed error message
 * @param sheetName - Name of the sheet tab where write was attempted
 */
export async function logCallLogWriteFailed(
  reservationId: number,
  userId: number,
  userEmail: string,
  reason: 'auth_expired' | 'permission_denied' | 'sheet_missing' | 'other',
  errorMessage: string,
  sheetName?: string
): Promise<void> {
  await createAuditLog(
    AUDIT_EVENTS.CALL_LOG_WRITE_FAILED,
    reservationId,
    userId,
    userEmail,
    {
      reason,
      errorMessage,
      sheetName,
      action: 'call_log_write_failed'
    }
  );
}
