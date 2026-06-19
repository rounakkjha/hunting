import { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Sparkles, Loader2, CheckCircle, XCircle, AlertCircle, Target, Wand2, Lightbulb, TrendingUp, ArrowRight, Copy, Download, X } from 'lucide-react';
import { matchResumeWithJD, generateRevisionPrompt, type MatchResponse } from '../utils/ai';
import { extractTextFromFile } from '../utils/fileParser';
import type { UserData, ResumeAnalysis } from '../App';

interface ResumeMatcherProps {
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
}

export default function ResumeMatcher({ userData, setUserData }: ResumeMatcherProps) {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdFileName, setJdFileName] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [lengthConstraint, setLengthConstraint] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [showPastAnalyses, setShowPastAnalyses] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 600);
      return () => clearTimeout(timeout);
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      // Smooth exponential curve: 50% at ~20s, ~85% at ~50s, asymptotically approaches 100%
      const next = Math.min(99.5, 100 * (1 - Math.exp(-elapsed / 20000)));
      setProgress(next);

      if (next < 25) setProgressMessage('Reading your resume and JD...');
      else if (next < 45) setProgressMessage('Matching skills and experience...');
      else if (next < 65) setProgressMessage('Comparing requirements...');
      else if (next < 85) setProgressMessage('Almost there...');
      else setProgressMessage('Taking a little longer than expected. Sit relaxed, your insights are coming...');
    }, 300);

    return () => clearInterval(interval);
  }, [loading]);

  const handleFile = async (
    file: File,
    setText: (s: string) => void,
    setFileName: (s: string) => void
  ) => {
    try {
      const text = await extractTextFromFile(file);
      setText(text);
      setFileName(file.name);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
    }
  };

  const handleAnalyze = async () => {
    if (!jdText.trim() || !resumeText.trim()) {
      setError('Please provide both a job description and a resume.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await matchResumeWithJD(resumeText.trim(), jdText.trim());
      setResult(data);
      if ('error' in data && data.error) {
        setError(data.reason);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasResult = result && !('error' in result && result.error);
  const typedResult = hasResult ? (result as Exclude<MatchResponse, { error: true }>) : null;

  const handleGenerateRevision = async () => {
    if (!typedResult || !resumeText.trim()) return;
    setRevisionLoading(true);
    setError('');
    try {
      const prompt = await generateRevisionPrompt(typedResult, resumeText.trim(), {
        lengthConstraint,
        roleTitle,
        company,
        jobDescription: jdText.trim(),
      });
      setRevisionPrompt(prompt);
      setShowRevisionModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate revision prompt.');
    } finally {
      setRevisionLoading(false);
    }
  };

  const handleSaveAnalysis = () => {
    if (!typedResult || !resumeText.trim() || !jdText.trim()) return;
    const title = analysisTitle.trim() || `${roleTitle || 'Untitled role'} — ${company || 'Unknown company'}`;
    const newAnalysis: ResumeAnalysis = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title,
      company: company || undefined,
      role: roleTitle || undefined,
      jdText: jdText.trim(),
      resumeText: resumeText.trim(),
      result: typedResult,
    };
    setUserData((prev) => ({
      ...prev,
      resumeAnalyses: [newAnalysis, ...prev.resumeAnalyses],
    }));
    setAnalysisTitle('');
  };

  const handleLoadAnalysis = (analysis: ResumeAnalysis) => {
    setJdText(analysis.jdText);
    setResumeText(analysis.resumeText);
    setResult(analysis.result);
    setRoleTitle(analysis.role || '');
    setCompany(analysis.company || '');
    setAnalysisTitle(analysis.title || '');
    setShowPastAnalyses(false);
    setError('');
  };

  const handleNewAnalysis = () => {
    setJdText('');
    setResumeText('');
    setJdFileName('');
    setResumeFileName('');
    setResult(null);
    setError('');
    setAnalysisTitle('');
    setRoleTitle('');
    setCompany('');
    setShowPastAnalyses(false);
    setShowRevisionModal(false);
    setRevisionPrompt('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Resume Matcher</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compare a job description with your resume and get a detailed improvement plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors"
          >
            <FileText className="w-4 h-4" />
            New Analysis
          </button>
          <button
            onClick={() => setShowPastAnalyses(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Past Analyses
            {userData.resumeAnalyses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-white rounded-full">
                {userData.resumeAnalyses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <InputCard
          title="Job Description"
          icon={<FileText className="w-4 h-4" />}
          value={jdText}
          onChange={setJdText}
          fileName={jdFileName}
          fileRef={jdInputRef}
          onFile={(file) => handleFile(file, setJdText, setJdFileName)}
          placeholder="Paste the job description here..."
        />
        <InputCard
          title="Your Resume"
          icon={<FileText className="w-4 h-4" />}
          value={resumeText}
          onChange={setResumeText}
          fileName={resumeFileName}
          fileRef={resumeInputRef}
          onFile={(file) => handleFile(file, setResumeText, setResumeFileName)}
          placeholder="Paste your resume here..."
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Analyze Match
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          Powered by local Ollama. Make sure Ollama is running on your machine.
        </p>
      </div>

      {loading && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {progressMessage}
            </span>
            <span className="font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {typedResult && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card border border-border rounded-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-5 border-b border-border">
              <div>
                <h3 className="text-base font-semibold">Match Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  {[roleTitle, company].filter(Boolean).join(' at ') || 'Untitled analysis'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={analysisTitle}
                  onChange={(e) => setAnalysisTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleSaveAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <ScoreHeader result={typedResult} />
              <CategoryScores scores={typedResult.category_scores} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RequirementLists
                  mustHaves={typedResult.must_haves}
                  niceToHaves={typedResult.nice_to_haves}
                />
                <KeywordLists
                  missing={typedResult.missing_keywords}
                  strengths={typedResult.strengths}
                  gaps={typedResult.gaps}
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 sm:p-6">
            <h3 className="text-base font-semibold mb-5">Action Plan</h3>
            <Improvements improvements={typedResult.improvements} />

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold mb-3">Generate AI Revision Prompt</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create a copy-paste prompt for ChatGPT / Claude / Gemini.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={lengthConstraint}
                  onChange={(e) => setLengthConstraint(e.target.value)}
                  placeholder="Length (e.g. 1 page)"
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Role title (optional)"
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company (optional)"
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handleGenerateRevision}
                disabled={revisionLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
              >
                {revisionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating prompt...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Revision Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevisionModal && (
        <RevisionPromptModal
          prompt={revisionPrompt}
          onClose={() => setShowRevisionModal(false)}
        />
      )}

      {showPastAnalyses && (
        <PastAnalysesModal
          analyses={userData.resumeAnalyses}
          onLoad={handleLoadAnalysis}
          onClose={() => setShowPastAnalyses(false)}
        />
      )}
    </div>
  );
}

function InputCard({
  title,
  icon,
  value,
  onChange,
  fileName,
  fileRef,
  onFile,
  placeholder,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (s: string) => void;
  fileName: string;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File) => void;
  placeholder: string;
}) {
  return (
    <div className="border border-border rounded-lg p-4 sm:p-5 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </div>
      {fileName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          {fileName}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 sm:h-80 px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors resize-none text-sm leading-relaxed"
      />
    </div>
  );
}

function ScoreHeader({ result }: { result: Exclude<MatchResponse, { error: true }> }) {
  const score = typeof result.overall_match_percentage === 'number' ? result.overall_match_percentage : 0;
  const verdict = result.verdict || 'no verdict';
  const summary = result.summary || '';
  const gateApplied = result.gate_applied || 'none';
  const projected = typeof result.projected_score_if_applied === 'number' ? result.projected_score_if_applied : score;
  let color = 'text-red-600 dark:text-red-400';
  let bg = 'bg-red-500/10';
  let border = 'border-red-500/20';
  if (score >= 75) {
    color = 'text-emerald-600 dark:text-emerald-400';
    bg = 'bg-emerald-500/10';
    border = 'border-emerald-500/20';
  } else if (score >= 60) {
    color = 'text-amber-600 dark:text-amber-400';
    bg = 'bg-amber-500/10';
    border = 'border-amber-500/20';
  } else if (score >= 40) {
    color = 'text-orange-600 dark:text-orange-400';
    bg = 'bg-orange-500/10';
    border = 'border-orange-500/20';
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div className={`shrink-0 flex flex-col items-center justify-center w-28 h-24 rounded-lg border ${border} ${bg}`}>
        <span className={`text-3xl font-bold ${color}`}>{score}%</span>
        <span className="text-xs text-muted-foreground mt-1">Overall match</span>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold capitalize">{verdict}</h3>
          {gateApplied && gateApplied !== 'none' && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md border border-border">
              Gate: {gateApplied}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        <p className="text-sm text-muted-foreground">
          Projected score after rewording: <span className="font-semibold text-primary">{projected}%</span>
        </p>
      </div>
    </div>
  );
}

function CategoryScores({ scores }: { scores: Record<string, { score: number; weight: number; rationale: string }> }) {
  const safeScores = scores || {};
  const entries = Object.entries(safeScores);
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Category Breakdown</h4>
      <div className="space-y-2">
        {entries.map(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-background border border-border rounded-md"
            >
              <div className="sm:w-44">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{Math.round((value.weight || 0) * 100)}% weight</p>
              </div>
              <div className="flex-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${value.score || 0}%` }}
                  />
                </div>
              </div>
              <div className="sm:w-16 text-right">
                <span className="text-sm font-semibold">{value.score || 0}/100</span>
              </div>
              {value.rationale && (
                <p className="text-xs text-muted-foreground w-full">{value.rationale}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequirementLists({
  mustHaves,
  niceToHaves,
}: {
  mustHaves: any[];
  niceToHaves: any[];
}) {
  const normalize = (arr: any[]) => (Array.isArray(arr) ? arr : []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold mb-3">Must-Haves</h4>
        <div className="space-y-2">
          {normalize(mustHaves).map((item, i) => (
            <RequirementItem key={i} item={item} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Nice-To-Haves</h4>
        <div className="space-y-2">
          {normalize(niceToHaves).map((item, i) => (
            <RequirementItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ item }: { item: any }) {
  if (typeof item === 'string') {
    return (
      <div className="flex items-start gap-2 p-2 bg-background border border-border rounded-md text-sm">
        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p className="font-medium">{item}</p>
      </div>
    );
  }

  const req = item?.requirement || item?.text || 'Unnamed requirement';
  const status = item?.status || 'missing';
  const isMet = status === 'met';
  const isPartial = status === 'partial';
  const icon = isMet ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : isPartial ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
  return (
    <div className="flex items-start gap-2 p-2 bg-background border border-border rounded-md text-sm">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{req}</p>
        {item?.evidence && (
          <p className="text-xs text-muted-foreground mt-1 italic border-l-2 border-primary/30 pl-2">
            “{item.evidence}”
          </p>
        )}
      </div>
    </div>
  );
}

function KeywordLists({
  missing,
  strengths,
  gaps,
}: {
  missing: any[];
  strengths: any[];
  gaps: any[];
}) {
  const normalize = (arr: any[]) => (Array.isArray(arr) ? arr : []);
  return (
    <div className="space-y-5">
      <KeywordGroup title="Missing ATS Keywords" items={normalize(missing)} color="red" />
      <KeywordGroup title="Strengths" items={normalize(strengths)} color="emerald" />
      <KeywordGroup title="Biggest Gaps" items={normalize(gaps)} color="orange" />
    </div>
  );
}

function KeywordGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: any[];
  color: 'red' | 'emerald' | 'orange';
}) {
  const colorClasses = {
    red: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300',
  };

  if (!items.length) return null;

  const renderItem = (item: any): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      if (item.issue && item.why_it_matters) {
        return `${item.issue} — ${item.why_it_matters}`;
      }
      return Object.values(item).map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' — ');
    }
    return String(item);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-xs px-2.5 py-1.5 rounded border ${colorClasses[color]}`}
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Improvements({ improvements }: { improvements: any[] }) {
  if (!improvements.length) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const valid = improvements.filter((item) => item && typeof item === 'object');
  const sorted = [...valid].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="space-y-3">
      {sorted.map((item, i) => (
        <div
          key={i}
          className="p-4 bg-background border border-border rounded-md space-y-2"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                item.priority === 'high'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : item.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              {item.priority}
            </span>
            <span className="text-xs text-muted-foreground">{item.category}</span>
          </div>
          <p className="text-sm font-medium">{item.issue || 'No issue provided'}</p>
          <p className="text-xs text-muted-foreground">{item.why_it_matters || ''}</p>
          <p className="text-sm text-primary flex items-start gap-1.5">
            <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
            {item.action || 'No action provided'}
          </p>
          {item.example_before && item.example_after && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
              <div className="p-2.5 rounded bg-red-500/5 border border-red-500/10">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Before</p>
                <p className="text-muted-foreground italic">{item.example_before}</p>
              </div>
              <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">After</p>
                <p className="text-emerald-600 dark:text-emerald-400 italic">{item.example_after}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RevisionPromptModal({ prompt, onClose }: { prompt: string; onClose: () => void }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-revision-prompt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold">Revision Prompt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-md border border-border transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            value={prompt}
            readOnly
            className="w-full h-96 px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:border-primary resize-none text-sm leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
}

function PastAnalysesModal({
  analyses,
  onLoad,
  onClose,
}: {
  analyses: ResumeAnalysis[];
  onLoad: (analysis: ResumeAnalysis) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold">Past Analyses</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {!analyses.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved analyses yet. Analyze and save a JD + resume to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {analyses.map((analysis) => {
                const date = new Date(analysis.date).toLocaleDateString();
                const result = analysis.result as Exclude<MatchResponse, { error: true }>;
                const score = result?.overall_match_percentage ?? '?';
                return (
                  <div
                    key={analysis.id}
                    className="p-3 bg-background border border-border rounded-md flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{analysis.title || 'Untitled analysis'}</p>
                      <p className="text-xs text-muted-foreground">
                        {date} · Match: {score}%
                      </p>
                      {(analysis.role || analysis.company) && (
                        <p className="text-xs text-primary mt-1">
                          {[analysis.role, analysis.company].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onLoad(analysis)}
                      className="px-3 py-1.5 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
                    >
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
