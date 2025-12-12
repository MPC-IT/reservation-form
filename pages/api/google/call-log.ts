import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { format } from "date-fns";
import { authOptions } from "../auth/[...nextauth]";
import { getCallLogData } from "../../../lib/google-sheets";

type SessionWithAccessToken = {
  accessToken?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions
    )) as SessionWithAccessToken | null;

    const accessToken = session?.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        error: "Missing Google access token. Please sign in with Google again.",
      });
    }

    const requestedTab = typeof req.query.date === "string" ? req.query.date : "";
    const sheetName = requestedTab.trim() || format(new Date(), "EEE MM.dd.yyyy");

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      return res.status(500).json({
        error: "GOOGLE_SHEETS_ID not configured",
      });
    }

    // ✅ Updated: pull records out so frontend gets an array
    const { records, headers, total } = await getCallLogData(
      accessToken,
      spreadsheetId,
      sheetName
    );

    return res.status(200).json({
      sheetName,
      callLogs: records, // ✅ array
      headers,           // optional
      total,             // optional
    });
  } catch (error: any) {
    const msg = error?.message || "Failed to fetch call log";

    // Handle Google Sheets authentication errors with detailed responses
    if (
      msg.includes("insufficient authentication scopes") ||
      msg.includes("invalid authentication credentials") ||
      msg.includes("access token expired") ||
      msg.includes("invalid_grant") ||
      msg.includes("unauthorized") ||
      error?.code === 401 ||
      error?.code === 403
    ) {
      // Provide specific error messages based on the type of auth failure
      let authErrorMessage = "Google authentication failed. Please sign in with Google again.";
      
      if (msg.includes("insufficient authentication scopes")) {
        authErrorMessage = "Google authentication requires additional permissions. Please sign in with Google again and grant the required permissions.";
      } else if (msg.includes("access token expired") || msg.includes("invalid_grant")) {
        authErrorMessage = "Google access token has expired. Please sign in with Google again.";
      } else if (msg.includes("invalid authentication credentials")) {
        authErrorMessage = "Google authentication credentials are invalid. Please contact your administrator.";
      }

      return res.status(403).json({ 
        error: authErrorMessage,
        requiresReauth: true,
        errorType: 'auth_failure'
      });
    }

    // Handle quota exceeded errors
    if (
      msg.includes("quota exceeded") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests") ||
      error?.code === 429
    ) {
      return res.status(429).json({ 
        error: "Google Sheets quota exceeded. Please try again later.",
        errorType: 'quota_exceeded'
      });
    }

    // Handle spreadsheet not found errors
    if (
      msg.includes("spreadsheet not found") ||
      msg.includes("not found") ||
      error?.code === 404
    ) {
      return res.status(404).json({ 
        error: "Google Spreadsheet not found. Please check the spreadsheet ID configuration.",
        errorType: 'spreadsheet_not_found'
      });
    }

    console.error("Error in call log API:", error);
    return res.status(500).json({ 
      error: msg,
      errorType: 'server_error'
    });
  }
}
