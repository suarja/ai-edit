import { API_ENDPOINTS } from '@/lib/config/api';

interface ReportIssuePayload {
  jobId: string;
  errorMessage?: string | null;
  token: string;
}

export class SupportService {
  static async reportIssue({ jobId, errorMessage, token }: ReportIssuePayload): Promise<{success: boolean, message: string}> {
    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    const response = await fetch(API_ENDPOINTS.SUPPORT_REPORT_ISSUE(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId: jobId,
        errorMessage: errorMessage,
      }),
    });

    if (response.status === 202) {
      return { success: true, message: "Report sent successfully." };
    } else {
      const result = await response.json();
      throw new Error(result.error || "An unknown error occurred while reporting the issue.");
    }
  }
} 