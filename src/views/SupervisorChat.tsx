import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, Terminal } from 'lucide-react';
import type { Mission } from '../types';
import { fmtClock } from '../lib/time';
import { useActions, useAppState, useBusy } from '../store/StoreProvider';

const QUICK_PROMPTS = [
  'Review my draft and tell me what is weakest.',
  'What should I collect next?',
  'Challenge my strongest judgment.',
  'Where is my sourcing thinnest?',
  'Check the deadline and tell me what to cut.',
];

export function SupervisorChat({ mission }: { mission: Mission }) {
  const actions = useActions();
  const state = useAppState();
  const busy = useBusy(`chat:${mission.id}`);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [mission.messages.length, busy]);

  const send = (value: string) => {
    const clean = value.trim();
    if (!clean || busy) return;
    setText('');
    void actions.askSupervisor(mission.id, clean);
  };

  const aiReady = state.settings.ai.enabled && state.settings.ai.apiKey.trim().length > 0;

  return (
    <div className="chat-shell">
      <div className="chat-head">
        <div>
          <div className="panel-title">Supervisor channel</div>
          <div className="panel-sub">
            {aiReady ? `AI supervisor · ${state.settings.ai.model}` : 'Offline tradecraft supervisor'}
          </div>
        </div>
        <span className={`tag ${aiReady ? 'tag-cyan' : 'tag-dim'}`}>
          {aiReady ? <Sparkles size={10} /> : <Terminal size={10} />}
          {aiReady ? 'AI ASSIST' : 'RULE ENGINE'}
        </span>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {mission.messages.length === 0 ? (
          <div className="callout">
            No traffic on this channel yet. The supervisor will answer with tradecraft direction and, when configured,
            an AI written read. It will not do the research for you.
          </div>
        ) : null}
        {mission.messages.map((message) => (
          <div key={message.id} className={`msg ${message.role === 'supervisor' ? 'msg-supervisor' : 'msg-analyst'}`}>
            <div className="msg-meta">
              <span>{message.role === 'supervisor' ? 'SUPERVISOR' : state.settings.callsign || 'ANALYST'}</span>
              <span>{fmtClock(message.at, true)}</span>
              {message.mode ? (
                <span className={`msg-mode ${message.mode}`}>{message.mode === 'ai' ? 'AI' : 'OFFLINE'}</span>
              ) : null}
              {message.kind === 'review' ? <span className="msg-mode offline">REVIEW</span> : null}
            </div>
            <div className="msg-text" style={{ whiteSpace: 'pre-wrap' }}>
              {message.text}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="msg msg-supervisor">
            <div className="msg-meta">
              <span>SUPERVISOR</span>
              <span>composing</span>
            </div>
            <div className="typing" aria-label="Supervisor is composing">
              <i />
              <i />
              <i />
            </div>
          </div>
        ) : null}
      </div>

      <div className="chat-quick">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="filter-chip"
            disabled={busy}
            onClick={() => send(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          className="textarea"
          rows={2}
          value={text}
          placeholder="Ask the supervisor about evidence, gaps, alternatives, or what to do next…"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send(text);
            }
          }}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !text.trim()}
          onClick={() => send(text)}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </div>

      {!aiReady ? (
        <p className="hint" style={{ padding: '0 12px 10px' }}>
          The offline supervisor applies fixed tradecraft rules and cannot read new sources. For a written read against
          your draft, configure an AI provider in <Link to="/settings">Settings</Link>. Everything else works offline.
        </p>
      ) : null}
    </div>
  );
}
