// Test file for Call Log Writer functionality
// This file can be used to manually test the Call Log integration

import { addToCallLog } from './callLogWriter';

// Example test data
const testReservation = {
  id: 12345,
  profileType: 'Passcode',
  callType: 'Single-Date Passcode',
  companyName: 'Test Company',
  dealName: 'Test Deal',
  setupName: 'John Doe',
  setupEmail: 'john@example.com',
  callDate: '2025-12-17',
  startTime: '2:00 PM',
  timeZone: 'Eastern',
  host: 'Test Host',
  duration: '60 min',
  createdAt: new Date(),
};

// Test function (can be called from a test API endpoint)
export async function testCallLogIntegration(accessToken: string) {
  try {
    const result = await addToCallLog(accessToken, testReservation);
    console.log('Call Log test result:', result);
    return result;
  } catch (error) {
    console.error('Call Log test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
