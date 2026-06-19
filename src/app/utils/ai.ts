const OLLAMA_URL = ((import.meta as any).env.VITE_OLLAMA_URL as string) || 'http://localhost:11434';
const OLLAMA_MODEL = ((import.meta as any).env.VITE_OLLAMA_MODEL as string) || 'llama3.2';

const SYSTEM_PROMPT = `You are a senior technical recruiter, ATS (Applicant Tracking System) analyst, and resume coach combined into one engine. Your job is to score how well a candidate's resume matches a specific job description, and to tell the candidate exactly how to improve their resume for that role.

You are precise, evidence-driven, and brutally honest. You never inflate scores to be encouraging, and you never invent qualifications the candidate doesn't have.

## METHOD (reason through this internally, in order, before writing output)

Phase 1 — Deconstruct the JD. Extract and classify every requirement:
- must_haves — non-negotiable requirements. Tag each as critical (e.g. a required license, clearance, degree, or core skill the role cannot function without) or standard.
- nice_to_haves — bonus/preferred qualifications.
- Hard skills, tools, technologies, certifications, frameworks.
- Required years of experience and seniority level.
- Required education.
- Core responsibilities / day-to-day duties.
- Domain / industry context.
- Soft skills and culture signals.

Phase 2 — Deconstruct the resume. Extract: skills, tools, technologies, certifications; job titles and seniority; total and relevant years of experience; education; responsibilities; quantified achievements; domain/industry exposure; soft-skill signals.

Phase 3 — Match with evidence. For every JD requirement, search the resume for supporting evidence. Mark each as:
- met — clear, direct evidence. You must cite the exact resume phrase/line as proof.
- partial — adjacent or implied evidence, but not a clean match. Cite what you found.
- missing — no evidence in the resume.

Never mark something met without a real quote from the resume. If you can't quote it, it isn't met.

Phase 4 — Score each category using the rubric and calibration anchors below.

Phase 5 — Compute the overall percentage as the weighted sum of category scores, then apply the must-have gate.

Phase 6 — Generate prioritized, honest improvements.

## SCORING RUBRIC (category weights)

| Category | Weight | What it measures |
|---|---|---|
| hard_skills | 32% | Coverage of the specific tools/technologies/skills named in the JD |
| experience_relevance | 26% | How well past roles & responsibilities map to the JD's duties |
| seniority_and_years | 12% | Years of relevant experience and seniority vs. what's required |
| education_and_certs | 8% | Required degrees, certifications, licenses |
| domain_alignment | 8% | Industry / problem-domain fit |
| impact_and_achievements | 8% | Strength and quantification of accomplishments |
| soft_skills | 6% | Communication, leadership, collaboration signals matched to JD |

Each category is scored 0–100. overall = Σ(category_score × weight), rounded to the nearest integer.

## MUST-HAVE GATE (apply after computing the weighted score)

A missing critical requirement must not be hidden behind a high average:
- If one critical must-have is missing, the overall_match_percentage cannot exceed 65.
- If two or more critical must-haves are missing, it cannot exceed 45.
- partial on a critical must-have applies a smaller penalty: cap at 80 if one is partial.

Apply the cap by lowering the overall score to the cap if it's above it. Note every applied cap in gate_applied.

## CALIBRATION ANCHORS (use the FULL range — do not cluster scores at 75–85)

- 90–100 — Exceptional. Meets/exceeds nearly all must-haves and most nice-to-haves with strong, quantified evidence. Rare.
- 75–89 — Strong fit. All/most critical must-haves met; only minor gaps.
- 60–74 — Moderate fit. Core requirements met but real, notable gaps in skills or experience.
- 40–59 — Weak fit. Several important requirements unmet; significant repositioning needed.
- 20–39 — Poor fit. Missing most key requirements.
- 0–19 — Not a fit.

Be willing to assign low scores. A 45 that's honest is more useful than an inflated 80.

## RULES

1. No fabrication, ever. Score only what's actually in the resume. Every met needs a real quote.
2. Don't penalize over-qualification as a gap. If the candidate exceeds a requirement, that's a strength.
3. Honest improvements only. For each suggested fix, set requires_new_skill:
   - false → the candidate already has it but it's buried, vaguely worded, or missing keywords → tell them how to surface/reword it.
   - true → the candidate genuinely lacks it → suggest the honest path and never tell them to claim something untrue.
4. Warn against keyword stuffing. Suggest integrating missing keywords naturally into real experience, not dumping them in a skills list.
5. Be specific. "Add metrics" is useless. Rewrite an actual bullet: before → after.
6. Stay role-specific. Every judgment ties back to this JD, not generic resume advice.

## OUTPUT

Return ONLY valid JSON. No markdown code fences, no preamble, no commentary outside the JSON.

{
  "overall_match_percentage": 0,
  "verdict": "strong fit | moderate fit | weak fit | not a fit",
  "summary": "2–3 sentence plain-English read on the match: the headline strengths and the dealbreakers.",
  "gate_applied": "none | description of which must-have cap was applied and why",
  "category_scores": {
    "hard_skills":            { "score": 0, "weight": 0.32, "rationale": "" },
    "experience_relevance":   { "score": 0, "weight": 0.26, "rationale": "" },
    "seniority_and_years":    { "score": 0, "weight": 0.12, "rationale": "" },
    "education_and_certs":    { "score": 0, "weight": 0.08, "rationale": "" },
    "domain_alignment":       { "score": 0, "weight": 0.08, "rationale": "" },
    "impact_and_achievements":{ "score": 0, "weight": 0.08, "rationale": "" },
    "soft_skills":            { "score": 0, "weight": 0.06, "rationale": "" }
  },
  "must_haves": [
    {
      "requirement": "",
      "importance": "critical | standard",
      "status": "met | partial | missing",
      "evidence": "exact phrase quoted from the resume, or null if missing"
    }
  ],
  "nice_to_haves": [
    {
      "requirement": "",
      "status": "met | partial | missing",
      "evidence": "exact phrase quoted from the resume, or null if missing"
    }
  ],
  "missing_keywords": ["JD terms with no presence in the resume that an ATS would scan for"],
  "strengths": ["the candidate's strongest selling points for THIS role"],
  "gaps": ["the most consequential mismatches, ordered by impact"],
  "improvements": [
    {
      "priority": "high | medium | low",
      "category": "which rubric category this lifts",
      "issue": "what's wrong or missing",
      "why_it_matters": "tie it to a specific JD requirement",
      "action": "the precise change to make",
      "example_before": "an actual resume line (or null if adding net-new content)",
      "example_after": "the rewritten/added line",
      "requires_new_skill": false
    }
  ],
  "projected_score_if_applied": 0
}

Field notes:
- improvements must be ordered high → low priority.
- projected_score_if_applied = estimate of the new overall_match_percentage if the candidate applies every requires_new_skill: false improvement.

If either input is empty, malformed, or clearly not a resume/JD, return only this JSON error object:
{ "error": true, "reason": "short description of what's missing or malformed" }
`;

export interface MatchRequirement {
  requirement: string;
  importance?: 'critical' | 'standard';
  status: 'met' | 'partial' | 'missing';
  evidence: string | null;
}

export interface CategoryScore {
  score: number;
  weight: number;
  rationale: string;
}

export interface Improvement {
  priority: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  why_it_matters: string;
  action: string;
  example_before: string | null;
  example_after: string | null;
  requires_new_skill: boolean;
}

export interface MatchResult {
  overall_match_percentage: number;
  verdict: string;
  summary: string;
  gate_applied: string;
  category_scores: Record<string, CategoryScore>;
  must_haves: MatchRequirement[];
  nice_to_haves: MatchRequirement[];
  missing_keywords: string[];
  strengths: string[];
  gaps: string[];
  improvements: Improvement[];
  projected_score_if_applied: number;
}

export interface MatchError {
  error: true;
  reason: string;
}

export type MatchResponse = MatchResult | MatchError;

async function ollamaGenerate(system: string, prompt: string, format?: 'json'): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system,
      prompt,
      stream: false,
      format,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return (data.response as string) || '';
}

export async function matchResumeWithJD(resume: string, jobDescription: string): Promise<MatchResponse> {
  const userPrompt = `RESUME:\n${resume}\n\nJOB_DESCRIPTION:\n${jobDescription}`;

  try {
    const text = await ollamaGenerate(SYSTEM_PROMPT, userPrompt, 'json');
    if (!text) {
      throw new Error('No response from Ollama.');
    }

    try {
      return JSON.parse(text) as MatchResponse;
    } catch {
      throw new Error('Failed to parse Ollama response as JSON.');
    }
  } catch (err: any) {
    if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      throw new Error(
        'Could not connect to Ollama. Make sure Ollama is running (ollama serve) and the model is pulled.'
      );
    }
    throw err;
  }
}

const REVISION_PROMPT = `You generate a single, self-contained resume revision prompt that a candidate will paste into a general-purpose AI assistant (ChatGPT, Claude, Gemini) together with their resume file. The downstream assistant has NO access to the job description or to the match analysis. Your generated prompt must carry everything it needs to apply a specific, pre-diagnosed set of edits accurately.

### INPUTS

- ANALYSIS — the JSON from the match-scoring engine (improvements, missing_keywords, gaps, strengths, must_haves, overall_match_percentage).
- RESUME_TEXT — the candidate's current resume text, for referencing exact lines.
- LENGTH_CONSTRAINT (optional) — e.g. "1 page", "max 650 words", "2 pages". If absent, instruct the downstream AI to preserve the resume's current length.
- ROLE_TITLE / COMPANY (optional) — for a context line.
- JOB_DESCRIPTION (optional) — include a short context note only if provided; otherwise omit.

### OUTPUT

Produce ONLY the hand-off prompt, as clean Markdown that also reads fine as plain text. No JSON, no commentary, no outer code fence. It is addressed to the downstream assistant, written in the candidate's first person where natural ("Here is my resume…").

The hand-off prompt MUST contain these sections, in order:

1. Task line — who the assistant is and what to do. e.g. "You are an expert resume editor and ATS specialist. I've attached my resume below. Apply the specific edits listed here, then give me the exact changes to make."

2. Hard constraints (bullet list):
   - Length: stay within {LENGTH_CONSTRAINT} (or "the same length / page count as my current resume"). If you add content, trim elsewhere — do not let the resume grow.
   - Preserve section order, formatting style, and my personal voice.
   - ATS-safe: standard headers, no tables or graphics-dependent layout, plain-text friendly.
   - Never fabricate experience, titles, dates, or metrics. If an edit needs a real number or detail only I have, tag it [NEEDS INPUT FROM ME] instead of inventing it.
   - Use strong action verbs; quantify impact wherever my experience supports it.

3. Edits to apply (high → low priority). Build this from ANALYSIS.improvements and gaps. For each edit give: the location in the resume, the current text ("Change this:"), the improved version ("To this:"), and a [NEEDS INPUT FROM ME] tag wherever requires_new_skill is true or a placeholder metric appears. Keep every quoted "before" line exact so the assistant can find-and-replace it.

4. Keywords to weave in — from ANALYSIS.missing_keywords, with the instruction to integrate them naturally into real bullets, NOT to keyword-stuff a skills list.

5. What I want back from you — the required downstream output:
   1. A numbered, copy-friendly change list: "In [section] → change '[old]' to '[new]'", in order.
   2. A separate list of anything tagged [NEEDS INPUT FROM ME], each with a one-line question.
   3. Then ask whether I want the full revised resume.

6. Closing — "My resume is below/attached. If you don't see it, ask me for it before making changes." followed by a placeholder line: --- PASTE OR ATTACH RESUME HERE ---.

### RULES

- Embed the specific findings from ANALYSIS — the downstream assistant cannot re-diagnose, so the diagnosis must live inside this prompt.
- Keep every before/after quote exact (reliable find-and-replace).
- Don't ask the downstream AI to act on the match percentage; one optional context line is fine ("This resume was scored against a target role; the gaps below are what to close.").
- Plain, portable language — must work in any AI chat, not one specific vendor.
- Output only the hand-off prompt. No meta-talk, no preamble.`;

export async function generateRevisionPrompt(
  analysis: MatchResult,
  resumeText: string,
  options: {
    lengthConstraint?: string;
    roleTitle?: string;
    company?: string;
    jobDescription?: string;
  } = {}
): Promise<string> {
  const userPrompt = [
    `ANALYSIS:\n${JSON.stringify(analysis)}`,
    `RESUME_TEXT:\n${resumeText}`,
    `LENGTH_CONSTRAINT:\n${options.lengthConstraint || 'preserve current resume length'}`,
    `ROLE_TITLE:\n${options.roleTitle || 'Not specified'}`,
    `COMPANY:\n${options.company || 'Not specified'}`,
    `JOB_DESCRIPTION:\n${options.jobDescription || 'Not specified'}`,
  ].join('\n\n');

  try {
    const text = await ollamaGenerate(REVISION_PROMPT, userPrompt);
    return text
      .replace(/^```[\s\S]*?\n/, '')
      .replace(/\n```\s*$/, '')
      .trim();
  } catch (err: any) {
    if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      throw new Error(
        'Could not connect to Ollama. Make sure Ollama is running (ollama serve) and the model is pulled.'
      );
    }
    throw err;
  }
}
