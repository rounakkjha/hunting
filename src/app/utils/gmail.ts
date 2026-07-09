// Gmail API integration via Supabase Edge Function
export interface GmailAuthResult {
  accessToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  raw: string;
}

// Gmail OAuth configuration
// Set VITE_GMAIL_CLIENT_ID in your .env.local file
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID as string || '';
const GMAIL_REDIRECT_URI = `${window.location.origin}/gmail-callback.html`;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string || '';
const GMAIL_OAUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gmail-oauth`;

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

export class GmailService {
  private static instance: GmailService;

  static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  // High-level authenticate method — opens popup OAuth flow
  async authenticate(): Promise<{ success: boolean; email?: string; accessToken?: string; refreshToken?: string; error?: string }> {
    if (!GMAIL_CLIENT_ID) {
      return {
        success: false,
        error: 'Gmail Client ID not configured. Please set VITE_GMAIL_CLIENT_ID in your .env.local file.',
      };
    }
    try {
      const result = await this.initiateOAuth();
      return {
        success: true,
        email: result.email,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  // Initiate OAuth popup flow
  async initiateOAuth(): Promise<GmailAuthResult> {
    return new Promise((resolve, reject) => {
      // Store Supabase config in localStorage so the callback page can read it
      try {
        localStorage.setItem('supabase_url', SUPABASE_URL);
        localStorage.setItem('supabase_anon_key', SUPABASE_ANON_KEY);
      } catch {}

      const authUrl = this.buildAuthUrl();
      const popup = window.open(authUrl, 'gmail-auth', 'width=500,height=600,scrollbars=yes');

      if (!popup) {
        reject(new Error('Failed to open popup. Please allow popups for this site.'));
        return;
      }

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'gmail-auth-success') {
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          popup.close();
          resolve(event.data.result);
        } else if (event.data.type === 'gmail-auth-error') {
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          reject(new Error('Authentication was cancelled'));
        }
      }, 1000);
    });
  }

  // Build OAuth authorization URL (authorization code flow)
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      redirect_uri: GMAIL_REDIRECT_URI,
      response_type: 'code',
      scope: GMAIL_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for tokens via Supabase Edge Function
  async exchangeCodeForTokens(code: string): Promise<GmailAuthResult> {
    const response = await fetch(GMAIL_OAUTH_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'exchange',
        code,
        redirectUri: GMAIL_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to exchange code for tokens');
    }

    return response.json();
  }

  // Refresh access token via Supabase Edge Function
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(GMAIL_OAUTH_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'refresh', refreshToken }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to refresh access token');
    }

    const data = await response.json();
    return data.accessToken;
  }

  // Send email using Gmail API — returns the Gmail message ID
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    accessToken: string,
    attachment?: { name: string; data: string } // data is a base64 data URL (e.g. "data:application/pdf;base64,...")
  ): Promise<string> {
    const emailData = attachment
      ? this.createEmailMessageWithAttachment(to, subject, body, attachment)
      : this.createEmailMessage(to, subject, body);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: emailData }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to send email: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.id as string;
  }

  // Create RFC 2822 formatted plain-text email message (base64url encoded)
  private createEmailMessage(to: string, subject: string, body: string): string {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\n');

    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Create RFC 2822 multipart/mixed email with a file attachment (base64url encoded)
  private createEmailMessageWithAttachment(
    to: string,
    subject: string,
    body: string,
    attachment: { name: string; data: string }
  ): string {
    const boundary = `boundary_${Date.now()}`;

    // Extract mime type and raw base64 from data URL (e.g. "data:application/pdf;base64,JVBERi...")
    let mimeType = 'application/octet-stream';
    let base64Data = attachment.data;
    const dataUrlMatch = attachment.data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    const lines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: ${mimeType}; name="${attachment.name}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.name}"`,
      '',
      // Wrap base64 at 76 chars per MIME spec
      base64Data.replace(/(.{76})/g, '$1\n').trimEnd(),
      '',
      `--${boundary}--`,
    ];

    const raw = lines.join('\n');
    return btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Get user email from access token
  async getUserEmail(accessToken: string): Promise<string> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return data.email;
  }

  // Revoke a token (disconnect)
  async revokeToken(token: string): Promise<void> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }

  // Check if token is expired
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt - 60000; // 1 min buffer
  }
}

// Export singleton instance
export const gmailService = GmailService.getInstance();
