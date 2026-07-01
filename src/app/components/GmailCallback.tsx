import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { gmailService, type GmailAuthResult } from '../utils/gmail';

export default function GmailCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const authResult = await gmailService.handleOAuthCallback();
        
        if (authResult) {
          // Store the auth result in localStorage for the main app to pick up
          localStorage.setItem('gmail-auth-result', JSON.stringify(authResult));
          setStatus('success');
          
          // Redirect back to the app after a short delay
          setTimeout(() => {
            navigate('/?gmail-auth=success', { replace: true });
          }, 2000);
        } else {
          setError('No authorization code received');
          setStatus('error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {status === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>
          
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Connecting to Gmail...'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {status === 'loading' && 'Please wait while we connect your Gmail account...'}
            {status === 'success' && 'Your Gmail account has been connected successfully. Redirecting...'}
            {status === 'error' && error}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              Back to App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}