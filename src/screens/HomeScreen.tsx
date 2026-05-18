import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, RotateCcw, RefreshCw, Settings, Check, Calendar, SlidersHorizontal, X, Download, Share2 } from 'lucide-react';
import { loadProgress } from '../store/sessionStore';
import { SESSIONS } from '../data/sessions';
import { TodayStatusMap } from '../lib/tracker';
import DailyTracker from '../components/DailyTracker';
import { getSettings, updateSettings, PersonalSettings, ThemeMode } from '../store/settingsStore';

interface Props {
  onSelectSession: (key: 'morning' | 'night') => void;
  onResume: () => void;
  todayStatus: TodayStatusMap;
  streaks: { morning: number; night: number; both: number };
  onCancelSession: (key: 'morning' | 'night') => void;
  onRestartSession: (key: 'morning' | 'night') => void;
  onAdmin?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function HomeScreen({ onSelectSession, onResume, todayStatus, streaks, onCancelSession, onRestartSession, onAdmin }: Props) {
  const saved = loadProgress();
  const resumeSession = saved ? SESSIONS[saved.sessionKey as 'morning' | 'night'] : null;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<'morning' | 'night' | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(getSettings());
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setShowIosInstallHint(isIos && !standalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    type Pt = { x: number; y: number; r: number; vy: number; vx: number; a: number };
    const pts: Pt[] = Array.from({ length: 44 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, vy: -(Math.random() * 0.22 + 0.07),
      vx: (Math.random() - 0.5) * 0.1, a: Math.random(),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        p.a = 0.55 + 0.45 * Math.sin(Date.now() / 2200 + p.x);
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,169,110,${p.a * 0.25})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const anim = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    animation: mounted ? `fadeUp 0.7s ${delay}ms both` : 'none',
  });

  const mStatus = todayStatus['morning'];
  const nStatus = todayStatus['night'];
  const morningDone = mStatus === 'completed';
  const nightDone = nStatus === 'completed';
  const morningCancelled = mStatus === 'cancelled';
  const nightCancelled = nStatus === 'cancelled';
  const bothDone = morningDone && nightDone;

  const applySetting = <K extends keyof PersonalSettings>(key: K, value: PersonalSettings[K]) => {
    const next = updateSettings({ [key]: value } as Partial<PersonalSettings>);
    setPersonalSettings(next);
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;
    try {
      await installPromptEvent.prompt();
      await installPromptEvent.userChoice;
    } catch {
      // ignore prompt failures silently
    }
    setInstallPromptEvent(null);
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--home-bg-gradient)',
      overflow: 'hidden', position: 'relative',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(200,169,110,0.05) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'breathe-slow 11s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.15rem 1.5rem 0.25rem', animation: 'fadeIn 0.5s ease both' }}>
        <div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: 'var(--gold-accent)', letterSpacing: '0.08em', opacity: 0.78 }}>
            Sadhaka
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.1em', marginTop: 1 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => {
              setPersonalSettings(getSettings());
              setShowSettingsModal(true);
            }}
            style={{
              ...topBtnStyle,
              color: showSettingsModal ? 'var(--gold-accent)' : 'var(--text-subtle)',
              borderColor: showSettingsModal ? 'var(--card-border)' : 'var(--border-soft)',
            }}
            title="Personal settings"
          >
            <SlidersHorizontal size={13} />
          </button>
          <button onClick={() => setShowTracker(s => !s)} style={{ ...topBtnStyle, color: showTracker ? 'var(--gold-accent)' : 'var(--text-subtle)', borderColor: showTracker ? 'var(--card-border)' : 'var(--border-soft)' }} title="Practice tracker">
            <Calendar size={13} />
          </button>
          {onAdmin && (
            <button onClick={onAdmin} style={topBtnStyle} title="Admin panel">
              <Settings size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 456, margin: '0 auto', padding: '1.5rem 1.5rem 3.1rem' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2.35rem', ...anim(0) }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--gold-accent)', lineHeight: 1, marginBottom: '0.6rem', textShadow: '0 0 30px var(--glow-soft)', animation: 'glow-pulse 4s ease-in-out infinite' }}>ॐ</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem, 8vw, 3rem)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.05, letterSpacing: '-0.01em', margin: 0 }}>
              <em style={{ color: 'var(--gold-accent)', fontStyle: 'italic' }}>Kundalini</em> Sadhana
            </h1>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-subtle)', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
              Daily Practice
            </div>
          </div>

          {installPromptEvent && (
            <div style={{ ...anim(35), marginBottom: '1.05rem' }}>
              <button
                onClick={handleInstallApp}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(200,169,110,0.2)',
                  background: 'var(--button-ghost-bg)',
                  color: 'var(--gold-accent)',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <Download size={12} />
                Install App
              </button>
            </div>
          )}

          {!installPromptEvent && showIosInstallHint && (
            <div style={{ ...anim(35), marginBottom: '1.05rem', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-soft)', background: 'var(--card-bg-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={11} color="var(--text-muted)" />
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                Use Share → Add to Home Screen.
              </span>
            </div>
          )}

          {/* Today's status bar */}
          <div style={{ ...anim(80), marginBottom: '1.55rem' }}>
            <TodayStatusBar
              morningDone={morningDone}
              nightDone={nightDone}
              morningCancelled={morningCancelled}
              nightCancelled={nightCancelled}
              streaks={streaks}
            />
          </div>

          {/* 28-day tracker — collapsible */}
          <div style={{ ...anim(100), marginBottom: '1.35rem' }}>
            <button
              onClick={() => setShowTracker(s => !s)}
              style={{
                width: '100%', padding: '10px 14px',
                background: showTracker ? 'var(--card-bg-soft)' : 'var(--card-bg-soft)',
                border: `1px solid ${showTracker ? 'var(--border-soft)' : 'var(--border-soft)'}`,
                borderRadius: showTracker ? '14px 14px 0 0' : 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.25s',
              }}
            >
              <Calendar size={12} color={showTracker ? 'var(--gold-accent)' : 'var(--text-subtle)'} />
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: showTracker ? 'var(--gold-accent)' : 'var(--text-subtle)', flex: 1, textAlign: 'left' }}>
                28-Day Practice Tracker
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: showTracker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-subtle)' }}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showTracker && (
              <div style={{
                background: 'var(--card-bg-soft)',
                border: '1px solid color-mix(in srgb, var(--border-soft) 75%, transparent)',
                borderTop: 'none',
                borderRadius: '0 0 14px 14px',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease both',
              }}>
                <DailyTracker />
              </div>
            )}
          </div>

          {/* Resume banner */}
          {resumeSession && (
            <div style={{ ...anim(120), marginBottom: '1.05rem' }}>
              <button onClick={onResume} style={{
                width: '100%', padding: '13px 15px', borderRadius: 14,
                border: '1px solid var(--border-soft)', background: 'var(--card-bg-soft)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
              }}>
                <RotateCcw size={14} color="var(--gold-accent)" strokeWidth={1.8} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--gold-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 1 }}>Resume</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    {resumeSession.label} · Practice {saved!.practiceIndex + 1} of {resumeSession.practices.length}
                  </div>
                </div>
                <span style={{ color: 'var(--text-subtle)', fontSize: 20 }}>›</span>
              </button>
            </div>
          )}

          {/* Session cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SessionCard
              onClick={() => { if (morningCancelled) onRestartSession('morning'); else if (!morningDone) onSelectSession('morning'); }}
              icon={<Sun size={20} color="#D4892A" strokeWidth={1.5} />}
              accentColor="#D4892A" title="Morning Session"
              subtitle="60 min · Ajna → Anahata · Ascending"
              delay={160} status={morningDone ? 'done' : morningCancelled ? 'cancelled' : 'pending'}
              onCancel={() => setCancelConfirm('morning')}
              onRestart={() => onRestartSession('morning')}
              style={anim(160)}
            />
            <SessionCard
              onClick={() => { if (nightCancelled) onRestartSession('night'); else if (!nightDone) onSelectSession('night'); }}
              icon={<Moon size={20} color="#6B7FBF" strokeWidth={1.5} />}
              accentColor="#6B7FBF" title="Night Session"
              subtitle="60 min · Vishuddhi → Bindu · Integrating"
              delay={220} status={nightDone ? 'done' : nightCancelled ? 'cancelled' : 'pending'}
              onCancel={() => setCancelConfirm('night')}
              onRestart={() => onRestartSession('night')}
              style={anim(220)}
            />
          </div>

          {bothDone && (
            <div style={{ textAlign: 'center', marginTop: '1.8rem', ...anim(300) }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: 'var(--button-ghost-bg)', border: '1px solid var(--border-soft)' }}>
                <Check size={12} color="var(--gold-accent)" />
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--gold-accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Both sessions complete today</span>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.85rem', fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.2em', textTransform: 'uppercase', ...anim(350) }}>
            Swami Satyananda Saraswati
          </div>
        </div>
      </div>

      {/* Cancel confirm dialog */}
      {cancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--overlay-backdrop)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', animation: 'fadeIn 0.2s ease both' }}>
          <div style={{ width: '100%', maxWidth: 320, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 20, padding: '1.7rem', animation: 'scaleIn 0.22s ease both', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 8 }}>Cancel Session?</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
              Today's <strong style={{ color: 'var(--text-primary)' }}>{cancelConfirm}</strong> session will be marked cancelled. You can restart it any time today.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setCancelConfirm(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-soft)', background: 'transparent', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Keep</button>
              <button onClick={() => { onCancelSession(cancelConfirm); setCancelConfirm(null); }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.08)', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E07070' }}>Cancel It</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'var(--overlay-backdrop-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.2rem', animation: 'fadeIn 0.2s ease both' }}>
          <div style={{ width: '100%', maxWidth: 430, maxHeight: '88vh', overflowY: 'auto', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: 20, padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--gold-accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>Personal</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.45rem', color: 'var(--surface-text)' }}>Settings</div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid var(--border-soft)', background: 'var(--card-bg-soft)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>

            <SettingsRow label="Language">
              <select value={personalSettings.language} onChange={e => applySetting('language', e.target.value as PersonalSettings['language'])} style={settingsSelectStyle}>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Theme">
              <select value={personalSettings.themeMode} onChange={e => applySetting('themeMode', e.target.value as ThemeMode)} style={settingsSelectStyle}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Narration Mode">
              <select value={personalSettings.narrationMode} onChange={e => applySetting('narrationMode', e.target.value as PersonalSettings['narrationMode'])} style={settingsSelectStyle}>
                <option value="full">Full</option>
                <option value="minimal">Minimal</option>
                <option value="silent">Silent</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Voice Enabled">
              <input type="checkbox" checked={personalSettings.voiceEnabled} onChange={e => applySetting('voiceEnabled', e.target.checked)} />
            </SettingsRow>

            <SettingsRow label="Ambient Enabled">
              <input type="checkbox" checked={personalSettings.ambientEnabled} onChange={e => applySetting('ambientEnabled', e.target.checked)} />
            </SettingsRow>

            <SettingsRow label={`Voice Volume (${Math.round(personalSettings.voiceVolume * 100)}%)`}>
              <input type="range" min={0} max={100} value={Math.round(personalSettings.voiceVolume * 100)} onChange={e => applySetting('voiceVolume', Number(e.target.value) / 100)} className="vol-slider" style={{ width: 132 }} />
            </SettingsRow>

            <SettingsRow label={`Ambient Volume (${Math.round(personalSettings.ambientVolume * 100)}%)`}>
              <input type="range" min={0} max={100} value={Math.round(personalSettings.ambientVolume * 100)} onChange={e => applySetting('ambientVolume', Number(e.target.value) / 100)} className="vol-slider" style={{ width: 132 }} />
            </SettingsRow>

            <SettingsRow label="Chakra Glow">
              <select value={personalSettings.chakraGlowIntensity} onChange={e => applySetting('chakraGlowIntensity', e.target.value as PersonalSettings['chakraGlowIntensity'])} style={settingsSelectStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Show Chakra Info">
              <input type="checkbox" checked={personalSettings.showChakraInfo} onChange={e => applySetting('showChakraInfo', e.target.checked)} />
            </SettingsRow>

            <SettingsRow label="Show Body Map">
              <input type="checkbox" checked={personalSettings.showBodyMap} onChange={e => applySetting('showBodyMap', e.target.checked)} />
            </SettingsRow>

            <SettingsRow label="Reminders Enabled">
              <input type="checkbox" checked={personalSettings.remindersEnabled} onChange={e => applySetting('remindersEnabled', e.target.checked)} />
            </SettingsRow>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 11px', borderRadius: 12, border: '1px solid var(--surface-border)', background: 'var(--field-bg)', marginBottom: 10 }}>
      <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--muted-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      {children}
    </div>
  );
}

function TodayStatusBar({
  morningDone,
  nightDone,
  morningCancelled,
  nightCancelled,
  streaks,
}: {
  morningDone: boolean;
  nightDone: boolean;
  morningCancelled: boolean;
  nightCancelled: boolean;
  streaks: { morning: number; night: number; both: number };
}) {
  const items = [
    { label: 'Morning', done: morningDone, cancelled: morningCancelled, color: '#D4892A', icon: <Sun size={11} /> },
    { label: 'Night', done: nightDone, cancelled: nightCancelled, color: '#6B7FBF', icon: <Moon size={11} /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {items.map(item => (
          <div key={item.label} style={{
            flex: 1, padding: '11px 12px', borderRadius: 14,
            background: item.done ? `${item.color}10` : item.cancelled ? 'rgba(220,80,80,0.06)' : 'var(--card-bg-soft)',
            border: `1px solid ${item.done ? item.color + '24' : item.cancelled ? 'rgba(220,80,80,0.12)' : 'transparent'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: item.done ? item.color : item.cancelled ? '#E07070' : 'var(--text-subtle)' }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: item.done ? item.color : item.cancelled ? '#E07070' : 'var(--text-subtle)', marginBottom: 1 }}>{item.label}</div>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: item.done ? 'var(--text-muted)' : item.cancelled ? '#5A3A3A' : 'var(--text-subtle)' }}>
                {item.done ? 'Complete' : item.cancelled ? 'Cancelled' : 'Pending'}
              </div>
            </div>
            {item.done && <Check size={12} color={item.color} strokeWidth={2} />}
            {item.cancelled && <RefreshCw size={11} color="#5A3A3A" />}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '9px 10px',
        borderRadius: 14,
        border: 'none',
        background: 'var(--card-bg-soft)',
      }}>
        <StreakPill label="Morning" value={streaks.morning} color="#D4892A" />
        <StreakPill label="Night" value={streaks.night} color="#6B7FBF" />
        <StreakPill label="Both" value={streaks.both} color="#C8A96E" />
      </div>
    </div>
  );
}

function StreakPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color, lineHeight: 1.1 }}>
        {value}d
      </div>
    </div>
  );
}

type SessionStatus = 'pending' | 'done' | 'cancelled';

function SessionCard({ onClick, icon, accentColor, title, subtitle, status, onCancel, onRestart, style }: {
  onClick: () => void; icon: React.ReactNode; accentColor: string;
  title: string; subtitle: string; delay: number; status: SessionStatus;
  onCancel: () => void; onRestart: () => void; style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const isDone = status === 'done';
  const isCancelled = status === 'cancelled';

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)} onTouchEnd={() => setTimeout(() => setHovered(false), 200)}
        disabled={isDone}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 15, padding: '1.15rem 1.18rem 1.15rem 1.22rem',
          border: `1px solid ${isDone ? accentColor + '2D' : isCancelled ? 'rgba(220,80,80,0.14)' : hovered ? accentColor + '2F' : 'transparent'}`,
          borderRadius: 18,
          background: isDone ? `${accentColor}07` : isCancelled ? 'rgba(220,80,80,0.035)' : 'var(--card-bg-soft)',
          cursor: isDone ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.22s ease',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Left accent stripe */}
        <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2, borderRadius: 2, background: isDone ? accentColor : isCancelled ? '#E07070' : hovered ? accentColor : 'transparent', transition: 'background 0.22s', boxShadow: (isDone || hovered) ? `0 0 6px ${accentColor}66` : 'none' }} />

        {/* Icon box */}
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: isDone ? `${accentColor}14` : `${accentColor}0d`, border: `1px solid ${isDone ? accentColor + '30' : accentColor + '1e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {icon}
          {isDone && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={15} color={accentColor} strokeWidth={2} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: isDone ? accentColor : isCancelled ? '#8A6A6A' : hovered ? 'var(--text-primary)' : 'var(--text-primary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 7 }}>
            {title}
            {isDone && <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: accentColor, opacity: 0.75, background: `${accentColor}14`, padding: '2px 6px', borderRadius: 5 }}>Done</span>}
            {isCancelled && <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E07070', background: 'rgba(220,80,80,0.1)', padding: '2px 6px', borderRadius: 5 }}>Cancelled</span>}
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: isCancelled ? '#5A4040' : 'var(--text-subtle)', letterSpacing: '0.05em', fontWeight: 300 }}>
            {isCancelled ? 'Tap to restart for today' : subtitle}
          </div>
        </div>

        {!isDone && (
          <span style={{ color: isCancelled ? '#5A4040' : hovered ? accentColor : 'var(--text-subtle)', fontSize: 20, transition: 'all 0.2s', transform: hovered && !isCancelled ? 'translateX(3px)' : 'none', display: 'inline-block', flexShrink: 0 }}>
            {isCancelled ? <RefreshCw size={15} color="#5A4040" /> : '›'}
          </span>
        )}
      </button>

      {/* Cancel Today button */}
      {status === 'pending' && (
        <button
          onClick={e => { e.stopPropagation(); onCancel(); }}
          style={{ position: 'absolute', top: 10, right: 10, borderRadius: 8, border: '1px solid rgba(220,80,80,0.16)', background: 'rgba(220,80,80,0.06)', cursor: 'pointer', color: '#E07070', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: '4px 7px', fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          title="Cancel today's session"
        >
          Cancel Today
        </button>
      )}

      {status === 'cancelled' && (
        <button
          onClick={e => { e.stopPropagation(); onRestart(); }}
          style={{ position: 'absolute', top: 10, right: 10, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--button-ghost-bg)', cursor: 'pointer', color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: '4px 7px', fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          title="Restart today's session"
        >
          Restart Today
        </button>
      )}
    </div>
  );
}

const topBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 9,
  border: '1px solid var(--border-soft)',
  background: 'var(--field-bg)',
  cursor: 'pointer', color: 'var(--muted-text)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s',
};

const settingsSelectStyle: React.CSSProperties = {
  minWidth: 118,
  borderRadius: 8,
  border: '1px solid var(--field-border)',
  background: 'var(--field-bg)',
  color: 'var(--field-text)',
  fontFamily: "'Raleway', sans-serif",
  fontSize: '10px',
  padding: '6px 8px',
  outline: 'none',
};
