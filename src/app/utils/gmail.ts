// Gmail API integration utility
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
const GMAIL_CLIENT_ID = 'YOUR_GMAIL_CLIENT_ID'; // Replace with actual client ID
const GMAIL_REDIRECT_URI = `${window.location.origin}/gmail-callback.html`;
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email'
];

export class GmailService {
  private static instance: GmailService;
  
  static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  // Initiate OAuth flow using popup
  async initiateOAuth(): Promise<GmailAuthResult> {
    return new Promise((resolve, reject) => {
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
          popup.close();
          resolve(event.data.result);
        } else if (event.data.type === 'gmail-auth-error') {
          window.removeEventListener('message', messageListener);
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

  // Build OAuth URL
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

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<GmailAuthResult> {
    try {
      const response = await fetch('/api/gmail/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Send email using Gmail API
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    accessToken: string
  ): Promise<void> {
    try {
      const emailData = this.createEmailMessage(to, subject, body);
      
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: emailData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${error.error?.message || 'Unknown error'}`);
      }

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Create RFC 2822 formatted email message
  private createEmailMessage(to: string, subject: string, body: string): string {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ].join('\n');

    // Base64 encode the email
    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch('/api/gmail/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Get user email from access token
  async getUserEmail(accessToken: string): Promise<string> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const data = await response.json();
      return data.email;
    } catch (error) {
      console.error('Error getting user email:', error);
      throw error;
    }
  }

  // Check if token is expired
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  // Handle OAuth callback
  async handleOAuthCallback(): Promise<GmailAuthResult | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      return null;
    }

    // Exchange code for tokens
    const authResult = await this.exchangeCodeForTokens(code);
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return authResult;
  }
}

// Export singleton instance
export const gmailService = GmailService.getInstance();