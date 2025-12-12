import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { addToCallLog } from "../../../lib/callLogWriter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      profileType,
      callType,
      companyName,
      setupName,
      setupEmail,
      callDate,
      startTime,
      timeZone,
      host,
      duration,
      dialInNumbers,
      internationalDialInNumbers,
      hostPasscode,
      guestPasscode,
      reservationId,
      participants,
      bridgeInstructions,
      // Assisted form fields
      dealReferenceName,
      speakerDirectAccessLink,
      speakerDialInNumbers,
      speakerInternationalDialInNumbers,
      speakerConferenceId,
      participantDirectAccessLink,
      participantDialInNumbers,
      participantInternationalDialInNumbers,
      participantConferenceId,
      conferenceReplay,
      replayFromDate,
      replayToDate,
      replayEndTime,
      replayTimeZone,
      replayCode,
      replayAccessLink,
      multiview,
      multiviewAccessLink,
      multiviewUsername,
      multiviewConferenceNumber,
      participantList,
      participantListInformation,
      participantListRecipientEmail,
      operatorScript,
      operatorScriptVerbiage,
      conferenceMP3,
      conferenceTranscript,
      turnaroundTime,
      qa,
      qaSpecificOrder,
      // 24x7 specific fields
      referenceName,
    } = req.body;

    if (!profileType || !callType || !companyName) {
      return res.status(400).json({ error: "Missing required fields: profileType, callType, companyName" });
    }

    // Find or create company
    let company = await prisma.company.findUnique({
      where: { name: companyName }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName }
      });
    }

    // Find or create setup if provided
    let setup = null;
    if (setupName) {
      setup = await prisma.setup.findFirst({
        where: {
          name: setupName,
          companyId: company.id
        }
      });

      if (!setup) {
        setup = await prisma.setup.create({
          data: {
            name: setupName,
            email: setupEmail || null,
            companyId: company.id
          }
        });
      }
    }

    const profile = await prisma.profile.create({
      data: {
        profileType,
        callType,
        companyName: company.name,
        companyId: company.id,
        dealName: dealReferenceName || null,
        setupName: setupName || null,
        setupEmail: setupEmail || null,
        callDate: callDate || null,
        startTime: startTime || null,
        timeZone: timeZone || null,
        hostPasscode: hostPasscode || null,
        guestPasscode: guestPasscode || null,
        conferenceId: speakerConferenceId || participantConferenceId || null,
        notes: null,
        setupId: setup?.id || null,

        // When user hits Save, treat as Pending Confirmation
        status: "Pending Confirmation",
      },
    });

    // Add reservation to Call Log (non-blocking)
    try {
      // Get Google access token from session
      const googleSession = await getServerSession(req, res, authOptions);
      const accessToken = (googleSession as any)?.accessToken;

      if (accessToken && callDate && startTime) {
        const callLogResult = await addToCallLog(accessToken, {
          id: profile.id,
          profileType,
          callType,
          companyName: company.name,
          dealName: dealReferenceName || '',
          setupName: setupName || '',
          setupEmail: setupEmail || '',
          callDate,
          startTime,
          timeZone: timeZone || '',
          host,
          duration,
          createdAt: profile.createdAt,
        });

        if (!callLogResult.success) {
          console.error('Call Log update failed:', callLogResult.error);
          // Don't fail the reservation creation, just log the error
        } else {
          console.log(`Reservation ${profile.id} added to Call Log successfully`);
        }
      } else {
        console.warn('Missing Google access token or call date/time for Call Log update');
      }
    } catch (callLogError) {
      console.error('Unexpected error adding to Call Log:', callLogError);
      // Don't fail the reservation creation
    }

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Error creating profile:", err);
    return res.status(500).json({ error: "Failed to create reservation" });
  }
}
