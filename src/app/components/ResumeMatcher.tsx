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
    const estimatedMs = 25000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const next = Math.min(95, (elapsed / estimatedMs) * 100);
      setProgress(next);

      if (next < 25) setProgressMessage('Reading your resume and JD...');
      else if (next < 50) setProgressMessage('Matching skills and experience...');
      else if (next < 80) setProgressMessage('Comparing requirements...');
      else if (next < 95) setProgressMessage('Almost there...');
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
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Resume Matcher
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Paste or upload a job description and your resume. AI scores the match and tells you how to improve.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-border/50 transition-all"
          >
            <FileText className="w-4 h-4" />
            New Analysis
          </button>
          <button
            onClick={() => setShowPastAnalyses(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-background/60 hover:bg-primary/10 text-primary rounded-xl border border-primary/20 transition-all"
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {progressMessage}
            </span>
            <span className="font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {typedResult && (
        <div className="space-y-6 animate-fade-in">
          <ScoreHeader result={typedResult} />
          <CategoryScores scores={typedResult.category_scores} />
          <RequirementLists
            mustHaves={typedResult.must_haves}
            niceToHaves={typedResult.nice_to_haves}
          />
          <KeywordLists
            missing={typedResult.missing_keywords}
            strengths={typedResult.strengths}
            gaps={typedResult.gaps}
          />
          <Improvements improvements={typedResult.improvements} />

          <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold">Save Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Store this analysis so you can come back to it later or compare it with other roles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                placeholder="Analysis title (optional)"
                className="flex-1 px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
              <button
                onClick={handleSaveAnalysis}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Save Analysis
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Generate AI Revision Prompt</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a copy-paste prompt for ChatGPT / Claude / Gemini that tells it exactly how to rewrite your resume for this job.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={lengthConstraint}
                onChange={(e) => setLengthConstraint(e.target.value)}
                placeholder="Length (e.g. 1 page)"
                className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Role title (optional)"
                className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company (optional)"
                className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={handleGenerateRevision}
              disabled={revisionLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-60"
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
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg border border-border/50 transition-all"
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
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
          <CheckCircle className="w-3.5 h-3.5" />
          {fileName}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 sm:h-80 px-4 py-3 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all resize-none text-sm leading-relaxed"
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
  let color = 'text-red-500';
  let bg = 'bg-red-500/10';
  let border = 'border-red-500/20';
  if (score >= 75) {
    color = 'text-emerald-500';
    bg = 'bg-emerald-500/10';
    border = 'border-emerald-500/20';
  } else if (score >= 60) {
    color = 'text-amber-500';
    bg = 'bg-amber-500/10';
    border = 'border-amber-500/20';
  } else if (score >= 40) {
    color = 'text-orange-500';
    bg = 'bg-orange-500/10';
    border = 'border-orange-500/20';
  }

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border ${border} ${bg} flex flex-col sm:flex-row items-start sm:items-center gap-5`}>
      <div className="relative shrink-0">
        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${bg} border-4 ${border} flex items-center justify-center`}>
          <span className={`text-3xl sm:text-4xl font-bold ${color}`}>{score}%</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${color}`} />
          <h3 className="text-lg font-bold capitalize">{verdict}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        {gateApplied && gateApplied !== 'none' && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Gate applied:</span> {gateApplied}
          </p>
        )}
        <p className="text-sm font-medium">
          Projected score after rewording:{' '}
          <span className="text-primary">{projected}%</span>
        </p>
      </div>
    </div>
  );
}

function CategoryScores({ scores }: { scores: Record<string, { score: number; weight: number; rationale: string }> }) {
  const safeScores = scores || {};
  const entries = Object.entries(safeScores);
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Category Scores</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <div
              key={key}
              className="p-3 bg-background/50 rounded-xl border border-border/40 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{Math.round((value.weight || 0) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{ width: `${value.score || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">{value.score || 0}/100</span>
              </div>
              {value.rationale && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">{value.rationale}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Must-Haves
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {normalize(mustHaves).map((item, i) => (
            <RequirementItem key={i} item={item} />
          ))}
        </div>
      </div>
      <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          Nice-To-Haves
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
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
      <div className="p-3 bg-background/50 rounded-xl border border-border/40 text-sm">
        <p className="font-medium">{item}</p>
      </div>
    );
  }

  const req = item?.requirement || item?.text || 'Unnamed requirement';
  const status = item?.status || 'missing';
  const isMet = status === 'met';
  const isPartial = status === 'partial';
  const icon = isMet ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : isPartial ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  return (
    <div className="p-3 bg-background/50 rounded-xl border border-border/40 text-sm">
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{req}</p>
          {item?.importance && (
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${item.importance === 'critical' ? 'text-red-500' : 'text-muted-foreground'}`}>
              {item.importance}
            </span>
          )}
          {item?.evidence && (
            <p className="text-xs text-muted-foreground mt-1 italic border-l-2 border-primary/30 pl-2">
              “{item.evidence}”
            </p>
          )}
        </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <ListCard title="Missing ATS Keywords" items={normalize(missing)} color="red" />
      <ListCard title="Strengths" items={normalize(strengths)} color="emerald" />
      <ListCard title="Biggest Gaps" items={normalize(gaps)} color="orange" />
    </div>
  );
}

function ListCard({
  title,
  items,
  color,
}: {
  title: string;
  items: any[];
  color: 'red' | 'emerald' | 'orange';
}) {
  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
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
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <h3 className="font-bold text-sm">{title}</h3>
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-xs px-2.5 py-2 rounded-lg border ${colorClasses[color]}`}
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
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Prioritized Improvements</h3>
      </div>
      <div className="space-y-3">
        {sorted.map((item, i) => (
          <div
            key={i}
            className="p-4 bg-background/50 rounded-xl border border-border/40 space-y-2"
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
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Before</p>
                  <p className="text-muted-foreground italic">{item.example_before}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">After</p>
                  <p className="text-emerald-600 dark:text-emerald-400 italic">{item.example_after}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
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
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Revision Prompt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          <textarea
            value={prompt}
            readOnly
            className="w-full h-96 px-4 py-3 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all resize-none text-sm leading-relaxed font-mono"
          />
        </div>
        <div className="p-5 border-t border-border/50 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
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
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Past Analyses</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {!analyses.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved analyses yet. Analyze and save a JD + resume to see it here.
            </p>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => {
                const date = new Date(analysis.date).toLocaleDateString();
                const result = analysis.result as Exclude<MatchResponse, { error: true }>;
                const score = result?.overall_match_percentage ?? '?';
                return (
                  <div
                    key={analysis.id}
                    className="p-4 bg-background/50 rounded-xl border border-border/40 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{analysis.title || 'Untitled analysis'}</p>
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
                      className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-xl transition-all"
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
