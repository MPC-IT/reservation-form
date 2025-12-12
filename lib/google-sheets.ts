import { google } from "googleapis";

/**
 * Normalize headers so small differences (spaces/case)
 * don't break mapping.
 * Example: "Reservation ID" -> "reservation_id"
 */
function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export async function getGoogleSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.sheets({ version: "v4", auth });
}

export async function getCallLogData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
) {
  const sheets = await getGoogleSheetsClient(accessToken);

  // ✅ Validate sheet exists
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const sheetExists = spreadsheet.data.sheets?.some(
    (s) => s.properties?.title === sheetName
  );

  if (!sheetExists) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  // ✅ Headers are in Row 1
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const rawHeaders = headerRes.data.values?.[0];
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new Error("No headers found in row 1");
  }

  const headers = rawHeaders.map(normalizeHeader);

  // ✅ Data starts at Row 9 (Rows 2–8 are informational and ignored)
  const rowsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!9:100000`, // safely oversized
  });

  const rows = rowsRes.data.values ?? [];

  const records = rows
    .filter((row) => row.some((cell) => (cell ?? "").toString().trim() !== ""))
    .map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        obj[header] = (row[idx] ?? "").toString();
      });
      return obj;
    });

  return {
    headers,
    records,
    total: records.length,
  };
}
