import { useState, useRef } from 'react';
import { FileText, Upload, Sparkles, Loader2, CheckCircle, XCircle, AlertCircle, Target, Wand2, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import { matchResumeWithJD, type MatchResponse } from '../utils/ai';
import { extractTextFromFile } from '../utils/fileParser';

export default function ResumeMatcher() {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdFileName, setJdFileName] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MatchResponse | null>(null);

  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

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
        </div>
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
  const score = result.overall_match_percentage;
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
          <h3 className="text-lg font-bold capitalize">{result.verdict}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        {result.gate_applied && result.gate_applied !== 'none' && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Gate applied:</span> {result.gate_applied}
          </p>
        )}
        <p className="text-sm font-medium">
          Projected score after rewording:{' '}
          <span className="text-primary">{result.projected_score_if_applied}%</span>
        </p>
      </div>
    </div>
  );
}

function CategoryScores({ scores }: { scores: Record<string, { score: number; weight: number; rationale: string }> }) {
  const entries = Object.entries(scores);
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
                <span className="text-muted-foreground">{Math.round(value.weight * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{ width: `${value.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">{value.score}/100</span>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Must-Haves
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {mustHaves.map((item, i) => (
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
          {niceToHaves.map((item, i) => (
            <RequirementItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ item }: { item: any }) {
  const isMet = item.status === 'met';
  const isPartial = item.status === 'partial';
  const icon = isMet ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : isPartial ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  return (
    <div className="p-3 bg-background/50 rounded-xl border border-border/40 text-sm">
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{item.requirement}</p>
          {item.importance && (
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${item.importance === 'critical' ? 'text-red-500' : 'text-muted-foreground'}`}>
              {item.importance}
            </span>
          )}
          {item.evidence && (
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
  missing: string[];
  strengths: string[];
  gaps: string[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <ListCard title="Missing ATS Keywords" items={missing} color="red" />
      <ListCard title="Strengths" items={strengths} color="emerald" />
      <ListCard title="Biggest Gaps" items={gaps} color="orange" />
    </div>
  );
}

function ListCard({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: 'red' | 'emerald' | 'orange';
}) {
  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
  };

  if (!items.length) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <h3 className="font-bold text-sm">{title}</h3>
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-xs px-2.5 py-2 rounded-lg border ${colorClasses[color]}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Improvements({ improvements }: { improvements: any[] }) {
  if (!improvements.length) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...improvements].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

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
            <p className="text-sm font-medium">{item.issue}</p>
            <p className="text-xs text-muted-foreground">{item.why_it_matters}</p>
            <p className="text-sm text-primary flex items-start gap-1.5">
              <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
              {item.action}
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
