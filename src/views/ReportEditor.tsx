import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import type {
  Alternative,
  ConfidenceId,
  Credibility,
  EvidenceSource,
  KeyJudgment,
  Mission,
  Reliability,
  SourceType,
  VerificationStatus,
} from '../types';
import {
  CONFIDENCE_LEVELS,
  CREDIBILITY_CODES,
  MIN_SOURCES,
  RELIABILITY_CODES,
  SOURCE_TYPES,
  VERIFICATION_LABELS,
  confidenceMeta,
} from '../lib/constants';
import { requiredAlternatives } from '../lib/generator';
import { missionWordCount, reportProgress, sourceSummary } from '../lib/status';
import { wordCount } from '../lib/text';
import { fmtDate } from '../lib/time';
import { uid } from '../lib/ids';
import { useActions, useAppState } from '../store/StoreProvider';
import { ConfirmModal, ProgressBar } from '../components/ui';

export function ReportEditor({ mission, onSubmitted }: { mission: Mission; onSubmitted: () => void }) {
  const actions = useActions();
  const state = useAppState();
  const [confirming, setConfirming] = useState(false);
  const report = mission.report;
  const editable = mission.status === 'accepted';
  const progress = reportProgress(mission);
  const sources = sourceSummary(mission);
  const words = missionWordCount(mission);
  const minimum = MIN_SOURCES[mission.difficulty];
  const altRequired = requiredAlternatives(mission.difficulty);
  const overLimit = words > mission.deliverable.maxWords * 1.15;
  const openArticles = state.articles;

  const updateJudgment = (id: string, patch: Partial<KeyJudgment>) => {
    actions.updateReport(mission.id, {
      judgments: report.judgments.map((judgment) => (judgment.id === id ? { ...judgment, ...patch } : judgment)),
    });
  };

  const updateAlternative = (id: string, patch: Partial<Alternative>) => {
    actions.updateReport(mission.id, {
      alternatives: report.alternatives.map((alt) => (alt.id === id ? { ...alt, ...patch } : alt)),
    });
  };

  const updateSource = (id: string, patch: Partial<EvidenceSource>) => {
    actions.updateReport(mission.id, {
      sources: report.sources.map((source) => (source.id === id ? { ...source, ...patch } : source)),
    });
  };

  return (
    <div>
      <div className="report-toolbar">
        <div style={{ minWidth: 160, flex: '1 1 200px' }}>
          <div className="row-between tiny mono dim" style={{ marginBottom: 4 }}>
            <span>{progress.percent}% READY</span>
            <span>
              {words}/{mission.deliverable.maxWords} WORDS
            </span>
          </div>
          <ProgressBar percent={progress.percent} />
        </div>
        <span className="meta">
          {sources.count}/{minimum} SOURCES · {mission.deliverable.format}
        </span>
        <Link to="/reference" className="btn btn-sm" target="_blank" rel="noreferrer">
          <BookOpen size={12} /> Reference desk
        </Link>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setConfirming(true)}
          disabled={!editable}
        >
          <Send size={12} /> Submit report
        </button>
      </div>

      {!editable ? (
        <div className="callout cyan" style={{ marginBottom: 14 }}>
          <strong>Filing copy.</strong> This report is {mission.status === 'reviewed' ? 'under review or already reviewed' : 'locked while the review board is open'}.
          {mission.status === 'submitted' ? ' The deterministic audit has been posted below.' : ' Use the review board to open a revision post.'}
        </div>
      ) : null}

      {overLimit ? (
        <div className="callout rose" style={{ marginBottom: 14 }}>
          <strong>Over the word target.</strong> You are {words - mission.deliverable.maxWords} words past the
          {' '}{mission.deliverable.maxWords}-word limit. Cut background and restatement before cutting evidence.
        </div>
      ) : null}

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">01</span>
          <div>
            <div className="editor-title">Bottom line up front</div>
            <div className="editor-hint">
              One judgment, its confidence, and why it matters. No background, no throat-clearing.
            </div>
          </div>
          <span className="editor-count">{wordCount(report.bluf)} W</span>
        </div>
        <textarea
          className="textarea"
          rows={5}
          value={report.bluf}
          disabled={!editable}
          placeholder="Bottom line: likely / very likely that … because … [S1]"
          onChange={(event) => actions.updateReport(mission.id, { bluf: event.target.value })}
        />
      </section>

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">02</span>
          <div>
            <div className="editor-title">Key judgments</div>
            <div className="editor-hint">
              Consequential conclusions. Each needs a confidence from the yardstick and an inline [S#] citation.
            </div>
          </div>
          <span className="editor-count">
            {report.judgments.filter((judgment) => judgment.text.trim().length > 0).length} WRITTEN
          </span>
          <button
            type="button"
            className="btn btn-sm"
            disabled={!editable}
            onClick={() =>
              actions.updateReport(mission.id, {
                judgments: [
                  ...report.judgments,
                  { id: uid('kj'), text: '', confidence: 'even' },
                ],
              })
            }
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {report.judgments.length === 0 ? (
          <p className="hint">No judgments yet. Write at least two, each with a citation and a confidence.</p>
        ) : null}
        {report.judgments.map((judgment, index) => (
          <div className="judgment-row" key={judgment.id}>
            <textarea
              className="textarea"
              rows={3}
              value={judgment.text}
              disabled={!editable}
              placeholder={`Judgment ${index + 1} — state the assessment, not the topic.`}
              onChange={(event) => updateJudgment(judgment.id, { text: event.target.value })}
            />
            <select
              className="select"
              value={judgment.confidence}
              disabled={!editable}
              aria-label={`Confidence for judgment ${index + 1}`}
              onChange={(event) => updateJudgment(judgment.id, { confidence: event.target.value as ConfidenceId })}
            >
              {CONFIDENCE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.short} · {level.range}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label={`Remove judgment ${index + 1}`}
              disabled={!editable}
              onClick={() =>
                actions.updateReport(mission.id, {
                  judgments: report.judgments.filter((row) => row.id !== judgment.id),
                })
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </section>

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">03</span>
          <div>
            <div className="editor-title">Intelligence questions</div>
            <div className="editor-hint">
              Answer every PIR explicitly. A blank answer is a gap the consumer cannot see.
            </div>
          </div>
          <span className="editor-count">
            {mission.pirs.filter((pir) => (report.answers[pir.id] ?? '').trim().length >= 60).length}/{mission.pirs.length}
          </span>
        </div>
        {mission.pirs.map((pir, index) => (
          <div className="pir-answer" key={pir.id}>
            <div className="pir-question">
              <span className="pir-index">{index + 1}</span>
              {pir.question}
            </div>
            {pir.focus ? <div className="pir-focus">{pir.focus}</div> : null}
            <textarea
              className="textarea"
              rows={4}
              style={{ marginTop: 8 }}
              value={report.answers[pir.id] ?? ''}
              disabled={!editable}
              placeholder="Answer with evidence, confidence, and the limits of what you can establish."
              onChange={(event) =>
                actions.updateReport(mission.id, {
                  answers: { ...report.answers, [pir.id]: event.target.value },
                })
              }
            />
          </div>
        ))}
      </section>

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">04</span>
          <div>
            <div className="editor-title">Competing alternatives</div>
            <div className="editor-hint">
              At least {altRequired} for this difficulty. Evidence for, evidence against, and why you discount or favour it.
            </div>
          </div>
          <span className="editor-count">
            {report.alternatives.filter((alt) => alt.hypothesis.trim().length >= 8).length}/{altRequired}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            disabled={!editable}
            onClick={() =>
              actions.updateReport(mission.id, {
                alternatives: [
                  ...report.alternatives,
                  { id: uid('alt'), hypothesis: '', supporting: '', contradicting: '', assessment: '' },
                ],
              })
            }
          >
            <Plus size={12} /> Add alternative
          </button>
        </div>
        {report.alternatives.map((alt, index) => (
          <div className="alt-card" key={alt.id}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <span className="mono tiny dim">ALTERNATIVE {index + 1}</span>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label={`Remove alternative ${index + 1}`}
                disabled={!editable}
                onClick={() =>
                  actions.updateReport(mission.id, {
                    alternatives: report.alternatives.filter((row) => row.id !== alt.id),
                  })
                }
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="field">
              <label className="label" htmlFor={`alt-${alt.id}`}>Hypothesis</label>
              <input
                id={`alt-${alt.id}`}
                className="input"
                value={alt.hypothesis}
                disabled={!editable}
                placeholder="A rival explanation of the same evidence …"
                onChange={(event) => updateAlternative(alt.id, { hypothesis: event.target.value })}
              />
            </div>
            <div className="alt-grid" style={{ marginTop: 8 }}>
              <div className="field">
                <label className="label">Evidence for</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={alt.supporting}
                  disabled={!editable}
                  onChange={(event) => updateAlternative(alt.id, { supporting: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="label">Evidence against</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={alt.contradicting}
                  disabled={!editable}
                  onChange={(event) => updateAlternative(alt.id, { contradicting: event.target.value })}
                />
              </div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label className="label">Assessment</label>
              <textarea
                className="textarea"
                rows={2}
                value={alt.assessment}
                disabled={!editable}
                placeholder="Why this explanation is favoured, discounted, or still live."
                onChange={(event) => updateAlternative(alt.id, { assessment: event.target.value })}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">05</span>
          <div>
            <div className="editor-title">Gaps, indicators, methods</div>
            <div className="editor-hint">
              What remains unknown, what would change your judgment, and how the collection was done.
            </div>
          </div>
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label className="label">Intelligence gaps</label>
            <textarea
              className="textarea"
              rows={5}
              value={report.gaps}
              disabled={!editable}
              placeholder="Name the specific missing fact and what would collect it."
              onChange={(event) => actions.updateReport(mission.id, { gaps: event.target.value })}
            />
          </div>
          <div className="field">
            <label className="label">Indicators to watch</label>
            <textarea
              className="textarea"
              rows={5}
              value={report.indicators}
              disabled={!editable}
              placeholder="Observable developments, with thresholds and time frames."
              onChange={(event) => actions.updateReport(mission.id, { indicators: event.target.value })}
            />
          </div>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label className="label">Methods and provenance</label>
          <textarea
            className="textarea"
            rows={4}
            value={report.methods}
            disabled={!editable}
            placeholder="How you searched, what you checked, what you could not access, and how you verified media."
            onChange={(event) => actions.updateReport(mission.id, { methods: event.target.value })}
          />
        </div>
      </section>

      <section className="editor-block">
        <div className="editor-head">
          <span className="editor-num">06</span>
          <div>
            <div className="editor-title">Source register</div>
            <div className="editor-hint">
              One row per independent source. Grade the source and the information separately. Cite as [S#].
            </div>
          </div>
          <span className="editor-count">
            {sources.count}/{minimum} · {sources.unverified} UNVERIFIED
          </span>
          <button type="button" className="btn btn-sm" disabled={!editable} onClick={() => actions.addSource(mission.id)}>
            <Plus size={12} /> Add source
          </button>
        </div>

        {openArticles.length > 0 ? (
          <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <select
              className="select"
              style={{ maxWidth: 340 }}
              value=""
              disabled={!editable}
              onChange={(event) => {
                if (!event.target.value) return;
                actions.addSourceFromArticle(mission.id, event.target.value);
                actions.toast('Source added from the offline library.', 'good');
              }}
            >
              <option value="">Add from offline library…</option>
              {openArticles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title}
                </option>
              ))}
            </select>
            <Link to="/library" className="btn btn-sm" target="_blank" rel="noreferrer">
              <BookOpen size={12} /> Library
            </Link>
          </div>
        ) : (
          <p className="hint" style={{ marginBottom: 12 }}>
            The offline library is empty. Save an article there to attach a stored excerpt as a source.
          </p>
        )}

        {report.sources.length === 0 ? (
          <div className="callout">
            No sources logged. Minimum for this difficulty is {minimum}. The review will score sourcing at zero until
            the register has independently graded entries.
          </div>
        ) : null}

        {report.sources.map((source) => {
          const duplicate =
            source.url.trim().length > 0 &&
            report.sources.some((row) => row.id !== source.id && row.url.trim() === source.url.trim());
          return (
            <div className="source-card" key={source.id}>
              <div className="source-card-head">
                <span className="source-label">{source.label}</span>
                <span className="tag tag-dim">{VERIFICATION_LABELS[source.verification]}</span>
                {source.articleId ? <span className="tag tag-cyan">OFFLINE COPY</span> : null}
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  style={{ marginLeft: 'auto' }}
                  aria-label={`Remove source ${source.label}`}
                  disabled={!editable}
                  onClick={() => actions.removeSource(mission.id, source.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {duplicate ? (
                <div className="callout rose" style={{ margin: '8px 0' }}>
                  <strong>Duplicate URL.</strong> This locator already appears in another register row. Two rows for
                  one source are not corroboration.
                </div>
              ) : null}

              <div className="source-grid">
                <div className="field full">
                  <label className="label">Title</label>
                  <input
                    className="input"
                    value={source.title}
                    disabled={!editable}
                    placeholder="Exact title of the document, report, or page"
                    onChange={(event) => updateSource(source.id, { title: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label">Publisher</label>
                  <input
                    className="input"
                    value={source.publisher}
                    disabled={!editable}
                    onChange={(event) => updateSource(source.id, { publisher: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label">Published</label>
                  <input
                    className="input"
                    value={source.publishedAt}
                    disabled={!editable}
                    placeholder="YYYY-MM-DD"
                    onChange={(event) => updateSource(source.id, { publishedAt: event.target.value })}
                  />
                </div>
                <div className="field full">
                  <label className="label">URL / locator</label>
                  <div className="row" style={{ gap: 6 }}>
                    <input
                      className="input"
                      value={source.url}
                      disabled={!editable}
                      placeholder="https://…"
                      onChange={(event) => updateSource(source.id, { url: event.target.value })}
                    />
                    {source.url ? (
                      <a
                        className="btn btn-sm btn-icon"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Open source"
                      >
                        <ExternalLink size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="field">
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={source.type}
                    disabled={!editable}
                    onChange={(event) => updateSource(source.id, { type: event.target.value as SourceType })}
                  >
                    {SOURCE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Verification</label>
                  <select
                    className="select"
                    value={source.verification}
                    disabled={!editable}
                    onChange={(event) =>
                      updateSource(source.id, { verification: event.target.value as VerificationStatus })
                    }
                  >
                    {(Object.keys(VERIFICATION_LABELS) as VerificationStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {VERIFICATION_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Source reliability</label>
                  <select
                    className="select"
                    value={source.reliability}
                    disabled={!editable}
                    onChange={(event) => updateSource(source.id, { reliability: event.target.value as Reliability })}
                  >
                    {RELIABILITY_CODES.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Information credibility</label>
                  <select
                    className="select"
                    value={source.credibility}
                    disabled={!editable}
                    onChange={(event) => updateSource(source.id, { credibility: event.target.value as Credibility })}
                  >
                    {CREDIBILITY_CODES.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <label className="label">Excerpt used</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={source.excerpt}
                    disabled={!editable}
                    placeholder="Paste the sentence or figure you actually relied on. The review checks it against offline copies."
                    onChange={(event) => updateSource(source.id, { excerpt: event.target.value })}
                  />
                </div>
                <div className="field full">
                  <label className="label">Analyst note</label>
                  <input
                    className="input"
                    value={source.note}
                    disabled={!editable}
                    placeholder="Access, bias, what this source can and cannot prove."
                    onChange={(event) => updateSource(source.id, { note: event.target.value })}
                  />
                </div>
              </div>
              <div className="row-between tiny mono dim" style={{ marginTop: 8 }}>
                <span>ACCESSED {fmtDate(source.accessedAt)}</span>
                <span>
                  {source.reliability !== '?' || source.credibility !== '?'
                    ? `GRADE ${source.reliability}${source.credibility}`
                    : 'NOT GRADED'}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="row-between" style={{ marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="mono tiny dim">
          {progress.sections.filter((section) => !section.done).length} SECTION(S) INCOMPLETE · REVISION{' '}
          {report.revision}
        </div>
        <button type="button" className="btn btn-primary" disabled={!editable} onClick={() => setConfirming(true)}>
          <Send size={14} /> Submit report for review
        </button>
      </div>

      <ConfirmModal
        open={confirming}
        title="Submit report"
        confirmLabel="Submit for review"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void actions.submitMission(mission.id);
          onSubmitted();
        }}
      >
        <p>
          <strong>{mission.code}</strong> will be audited now against the public analytic standards. The audit is
          deterministic and offline; an AI written read is added only if the supervisor is enabled in Settings.
        </p>
        <div style={{ marginTop: 12 }}>
          <div className="row-between tiny mono dim" style={{ marginBottom: 6 }}>
            <span>{progress.percent}% READY</span>
            <span>
              {words}/{mission.deliverable.maxWords} WORDS
            </span>
          </div>
          <ProgressBar percent={progress.percent} />
        </div>
        <div className="stack" style={{ gap: 6, marginTop: 12 }}>
          {progress.sections.map((section) => (
            <div className="row-between text-sm" key={section.key}>
              <span className={section.done ? 'green' : 'muted'}>
                {section.done ? '✓' : '○'} {section.label}
              </span>
              <span className="mono tiny dim">{section.detail}</span>
            </div>
          ))}
        </div>
        {progress.sections.some((section) => !section.done) ? (
          <div className="callout rose" style={{ marginTop: 12 }}>
            <AlertTriangle size={12} /> Incomplete sections will be scored as gaps. Submitting is allowed; pretending
            they are finished is not.
          </div>
        ) : null}
        <p className="hint" style={{ marginTop: 10 }}>
          Confidence levels available for judgments range from {confidenceMeta('remote').short} to{' '}
          {confidenceMeta('almost-certain').short}. Use them deliberately.
        </p>
      </ConfirmModal>
    </div>
  );
}
