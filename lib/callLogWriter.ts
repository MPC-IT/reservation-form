import { format } from 'date-fns';
import { getGoogleSheetsClient } from './google-sheets';
import { logCallLogWritten, logCallLogWriteFailed } from './auditLogger';

export interface CallLogEntry {
  time: string;
  reservationId: string;
  callTitle: string;
  type: string;
  coordinator: string;
  lengthOfCall: string;
}

export interface ReservationData {
  id: number;
  profileType: string;
  callType: string;
  companyName: string;
  dealName: string;
  setupName: string;
  setupEmail: string;
  callDate: string;
  startTime: string;
  timeZone: string;
  host?: string;
  duration?: string;
  createdAt: Date;
}

/**
 * Adds a reservation to the Google Sheets Call Log
 */
export async function addToCallLog(
  accessToken: string,
  reservationData: ReservationData,
  userId?: number,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    const sheets = await getGoogleSheetsClient(accessToken);

    // Generate sheet name from reservation date
    const sheetName = generateSheetName(reservationData.callDate);

    // Ensure sheet exists with proper headers
    await ensureSheetExists(sheets, spreadsheetId, sheetName);

    // Map reservation data to Call Log format
    const callLogEntry = mapReservationToCallLog(reservationData);

    // Find the next available row (starting from row 9)
    const nextRow = await findNextAvailableRow(sheets, spreadsheetId, sheetName);

    // Append the new entry
    await appendCallLogEntry(sheets, spreadsheetId, sheetName, callLogEntry, nextRow);

    // Log successful Call Log write
    if (userId && userEmail) {
      await logCallLogWritten(reservationData.id, userId, userEmail, sheetName);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to add reservation to Call Log:', error);
    
    // Log failed Call Log write with proper error categorization
    if (userId && userEmail) {
      let reason: 'auth_expired' | 'permission_denied' | 'sheet_missing' | 'other' = 'other';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('access token') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid_grant')) {
        reason = 'auth_expired';
      } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        reason = 'permission_denied';
      } else if (errorMessage.includes('sheet not found') || errorMessage.includes('spreadsheet not found')) {
        reason = 'sheet_missing';
      }
      
      await logCallLogWriteFailed(
        reservationData.id,
        userId,
        userEmail,
        reason,
        errorMessage,
        reservationData.callDate
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Updates a reservation in the Google Sheets Call Log
 * Handles date changes by moving entries between sheets
 */
export async function updateCallLog(
  accessToken: string,
  oldReservationData: ReservationData,
  newReservationData: ReservationData,
  userId?: number,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    const sheets = await getGoogleSheetsClient(accessToken);

    const oldSheetName = generateSheetName(oldReservationData.callDate);
    const newSheetName = generateSheetName(newReservationData.callDate);

    // If date changed, remove from old sheet and add to new sheet
    if (oldSheetName !== newSheetName) {
      // Remove from old sheet
      await removeFromCallLog(sheets, spreadsheetId, oldSheetName, oldReservationData.id);
      
      // Add to new sheet
      return await addToCallLog(accessToken, newReservationData, userId, userEmail);
    } else {
      // Update existing entry in same sheet
      const callLogEntry = mapReservationToCallLog(newReservationData);
      await updateCallLogEntry(sheets, spreadsheetId, newSheetName, newReservationData.id, callLogEntry);
      
      // Log successful Call Log update
      if (userId && userEmail) {
        await logCallLogWritten(newReservationData.id, userId, userEmail, newSheetName);
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to update reservation in Call Log:', error);
    
    // Log failed Call Log write with proper error categorization
    if (userId && userEmail) {
      let reason: 'auth_expired' | 'permission_denied' | 'sheet_missing' | 'other' = 'other';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('access token') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid_grant')) {
        reason = 'auth_expired';
      } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        reason = 'permission_denied';
      } else if (errorMessage.includes('sheet not found') || errorMessage.includes('spreadsheet not found')) {
        reason = 'sheet_missing';
      }
      
      await logCallLogWriteFailed(
        newReservationData.id,
        userId,
        userEmail,
        reason,
        errorMessage,
        newReservationData.callDate
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generates sheet name in format "EEE MM.dd.yyyy" (e.g. "Wed 12.17.2025")
 */
function generateSheetName(callDate: string): string {
  try {
    // Parse the call date - handle various formats
    const date = new Date(callDate);
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM-DD
      const [year, month, day] = callDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid call date format: ${callDate}`);
      }
      return format(parsedDate, 'EEE MM.dd.yyyy');
    }
    return format(date, 'EEE MM.dd.yyyy');
  } catch (error) {
    console.error('Error generating sheet name:', error);
    // Fallback to today's date
    return format(new Date(), 'EEE MM.dd.yyyy');
  }
}

/**
 * Ensures the sheet exists with proper headers in row 1
 */
async function ensureSheetExists(
  sheets: any,
  spreadsheetId: string,
  sheetName: string
): Promise<void> {
  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (s: any) => s.properties?.title === sheetName
    );

    if (!sheetExists) {
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      // Add headers to row 1
      const headers = [
        'Time',
        'Reservation ID',
        'Call Title',
        'Type',
        'Coordinator',
        'Length of Call'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });

      console.log(`Created new Call Log sheet: ${sheetName}`);
    } else {
      // Verify headers exist in row 1
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:F1`,
      });

      const existingHeaders = headerRes.data.values?.[0];
      const expectedHeaders = ['Time', 'Reservation ID', 'Call Title', 'Type', 'Coordinator', 'Length of Call'];

      if (!existingHeaders || existingHeaders.length === 0) {
        // Add missing headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:F1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [expectedHeaders],
          },
        });
      }
    }
  } catch (error) {
    console.error('Error ensuring sheet exists:', error);
    throw error;
  }
}

/**
 * Maps reservation data to Call Log entry format
 */
function mapReservationToCallLog(reservation: ReservationData): CallLogEntry {
  // Combine date and time for proper formatting
  const callDateTime = formatDateTime(reservation.callDate, reservation.startTime);

  return {
    time: callDateTime,
    reservationId: reservation.id.toString(),
    callTitle: reservation.dealName || `${reservation.companyName} - ${reservation.callType}`,
    type: reservation.callType,
    coordinator: reservation.setupName || reservation.setupEmail || 'Unknown',
    lengthOfCall: reservation.duration || '60 min', // Default to 60 minutes if not specified
  };
}

/**
 * Formats date and time for Call Log
 */
function formatDateTime(callDate: string, startTime: string): string {
  try {
    // Parse date and time
    const date = new Date(callDate);
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM-DD
      const [year, month, day] = callDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid call date format: ${callDate}`);
      }
    }

    // Format time (assuming startTime is in format like "2:00 PM" or "14:00")
    const formattedDate = format(date, 'MM/dd/yyyy');
    
    return `${formattedDate} ${startTime}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    // Fallback to current date and time
    return format(new Date(), 'MM/dd/yyyy h:mm a');
  }
}

/**
 * Finds the next available row starting from row 9
 */
async function findNextAvailableRow(
  sheets: any,
  spreadsheetId: string,
  sheetName: string
): Promise<number> {
  try {
    // Get data starting from row 9
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A9:A1000`, // Check first 1000 rows from row 9
    });

    const rows = response.data.values || [];
    
    // Find first empty row
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i] || rows[i].length === 0 || rows[i][0] === '') {
        return 9 + i; // Return actual row number (9 + offset)
      }
    }

    // If all rows are filled, return the next available row
    return 9 + rows.length;
  } catch (error) {
    console.error('Error finding next available row:', error);
    // Fallback to row 9
    return 9;
  }
}

/**
 * Appends a Call Log entry to the specified row
 */
async function appendCallLogEntry(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  entry: CallLogEntry,
  row: number
): Promise<void> {
  try {
    const values = [
      entry.time,
      entry.reservationId,
      entry.callTitle,
      entry.type,
      entry.coordinator,
      entry.lengthOfCall
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${row}:F${row}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    console.log(`Added Call Log entry to sheet "${sheetName}" at row ${row}`);
  } catch (error) {
    console.error('Error appending Call Log entry:', error);
    throw error;
  }
}

/**
 * Removes a reservation from the Call Log (used when date changes)
 */
async function removeFromCallLog(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  reservationId: number
): Promise<void> {
  try {
    // Find the row with the matching reservation ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = response.data.values || [];
    let targetRow = -1;

    // Find the row containing the reservation ID (column B typically contains reservation ID)
    for (let i = 0; i < values.length; i++) {
      if (values[i][1] && values[i][1].toString() === reservationId.toString()) {
        targetRow = i + 1; // Convert to 1-based indexing
        break;
      }
    }

    if (targetRow > 0) {
      // Delete the row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: await getSheetId(sheets, spreadsheetId, sheetName),
                  dimension: 'ROWS',
                  startIndex: targetRow - 1,
                  endIndex: targetRow,
                },
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error('Failed to remove from Call Log:', error);
    throw error;
  }
}

/**
 * Updates an existing Call Log entry
 */
async function updateCallLogEntry(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  reservationId: number,
  callLogEntry: CallLogEntry
): Promise<void> {
  try {
    // Find the row with the matching reservation ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = response.data.values || [];
    let targetRow = -1;

    // Find the row containing the reservation ID
    for (let i = 0; i < values.length; i++) {
      if (values[i][1] && values[i][1].toString() === reservationId.toString()) {
        targetRow = i + 1; // Convert to 1-based indexing
        break;
      }
    }

    if (targetRow > 0) {
      // Update the row with new data
      const updateData = [
        callLogEntry.time,
        callLogEntry.reservationId,
        callLogEntry.callTitle,
        callLogEntry.type,
        callLogEntry.coordinator,
        callLogEntry.lengthOfCall,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${targetRow}:F${targetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updateData],
        },
      });
    } else {
      // If not found, append as new entry
      await appendCallLogEntry(sheets, spreadsheetId, sheetName, callLogEntry, targetRow);
    }
  } catch (error) {
    console.error('Failed to update Call Log entry:', error);
    throw error;
  }
}

/**
 * Gets the sheet ID for a given sheet name
 */
async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = response.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId || 0;
  } catch (error) {
    console.error('Failed to get sheet ID:', error);
    throw error;
  }
}

/**
 * Utility function to get session access token for Call Log operations
 */
export async function getCallLogAccessToken(): Promise<string> {
  // This would typically get the access token from the session
  // For now, we'll assume it's passed from the API route that calls this
  throw new Error('Access token must be provided from the calling context');
}
