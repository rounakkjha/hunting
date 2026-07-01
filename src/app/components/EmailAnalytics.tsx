import { useState, useEffect } from 'react';
import { BarChart3, Mail, Open, MousePointer, AlertCircle, RefreshCw, Eye, Trash2, Filter, Download } from 'lucide-react';
import { emailSender, type EmailAnalytics } from '../utils/emailSender';
import type { ScheduledEmail } from '../App';

interface EmailAnalyticsProps {
  scheduledEmails: ScheduledEmail[];
  onRetryEmail: (emailId: string) => void;
}

export default function EmailAnalytics({ scheduledEmails, onRetryEmail }: EmailAnalyticsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState<'all' | 'sent' | 'opened' | 'clicked' | 'failed'>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLogs(emailSender.getAllEmailLogs());
    setStats(emailSender.getEmailStats());
  };

  const filteredLogs = logs.filter(log => {
    switch (filter) {
      case 'sent':
        return log.event === 'sent';
      case 'opened':
        return log.event === 'opened';
      case 'clicked':
        return log.event === 'clicked';
      case 'failed':
        return log.event === 'error' || log.event === 'bounced';
      default:
        return true;
    }
  });

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'clicked':
        return <MousePointer className="w-4 h-4 text-purple-500" />;
      case 'error':
      case 'bounced':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'sent':
        return 'text-blue-600 bg-blue-50';
      case 'opened':
        return 'text-green-600 bg-green-50';
      case 'clicked':
        return 'text-purple-600 bg-purple-50';
      case 'error':
      case 'bounced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all email logs?')) {
      localStorage.removeItem('emailLogs');
      loadData();
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `email-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold">{stats.totalSent}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Opened</p>
              <p className="text-2xl font-bold">{stats.totalOpened}</p>
              <p className="text-xs text-muted-foreground">{stats.openRate.toFixed(1)}% rate</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clicked</p>
              <p className="text-2xl font-bold">{stats.totalClicked}</p>
              <p className="text-xs text-muted-foreground">{stats.clickRate.toFixed(1)}% rate</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointer className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.totalBounced}</p>
              <p className="text-xs text-muted-foreground">{stats.bounceRate.toFixed(1)}% rate</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'sent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('opened')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'opened'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Opened
          </button>
          <button
            onClick={() => setFilter('clicked')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'clicked'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Clicked
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'failed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Failed
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 border border-border/50 rounded-2xl">
            <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No email logs found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' 
                ? 'Email activity will appear here once emails are sent'
                : `No ${filter} emails found`
              }
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={`${log.scheduledEmailId}-${log.timestamp}-${index}`}
              className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getEventIcon(log.event)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getEventColor(log.event)}`}>
                        {log.event.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">
                        Email ID: {log.scheduledEmailId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {log.data && Object.keys(log.data).length > 0 && (
                    <button
                      onClick={() => toggleLogExpansion(`${log.scheduledEmailId}-${log.timestamp}`)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLogs.has(`${log.scheduledEmailId}-${log.timestamp}`) && log.data && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Details:</h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error Actions */}
              {(log.event === 'error' || log.event === 'bounced') && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onRetryEmail(log.scheduledEmailId)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Send
                  </button>
                  {log.data?.error && (
                    <span className="text-xs text-red-600">
                      Error: {log.data.error}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}