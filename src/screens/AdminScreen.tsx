import { useRef, useState } from 'react';
import { ArrowLeft, BarChart2, Settings } from 'lucide-react';
import { SESSIONS } from '../data/sessions';
import { getTrackerData } from '../lib/tracker';
import {
  exportAppData,
  importAppData,
  clearAllAppData,
  getBackupSummary,
  BackupSummary,
} from '../store/backupStore';
import { getReminderSettings, updateReminderSettings, ReminderSettings } from '../store/reminderStore';
import { getPracticeMeta, updatePracticeMeta, PracticeMetaMap } from '../store/practiceMetaStore';

interface Props {
  onBack: () => void;
}

type Tab = 'stats' | 'settings';

export default function AdminScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('stats');
  const { days, streaks } = getTrackerData(28);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--home-bg-gradient)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1.15rem 1.45rem 1rem',
        borderBottom: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid var(--border-soft)',
          background: 'var(--button-ghost-bg)', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={14} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold-accent)', opacity: 0.7, marginBottom: 2 }}>
            Local
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 300, color: 'var(--text-primary)' }}>
            Settings Panel
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-soft)',
        flexShrink: 0,
      }}>
        {([['stats', <BarChart2 size={12} />, 'Statistics'], ['settings', <Settings size={12} />, 'Settings']] as [Tab, React.ReactNode, string][]).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t ? '2px solid var(--gold-accent)' : '2px solid transparent',
            color: tab === t ? 'var(--gold-accent)' : 'var(--text-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: "'Raleway', sans-serif", fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.3rem 1.6rem' }}>
        {tab === 'stats' ? <StatsTab days={days} streaks={streaks} /> : <LocalSettingsTab />}
      </div>
    </div>
  );
}

function StatsTab({
  days,
  streaks,
}: {
  days: Array<{ date: string; morning: string; night: string }>;
  streaks: { morning: number; night: number; both: number };
}) {
  const completedMorning = days.filter(d => d.morning === 'completed').length;
  const completedNight = days.filter(d => d.night === 'completed').length;
  const cancelledMorning = days.filter(d => d.morning === 'cancelled').length;
  const cancelledNight = days.filter(d => d.night === 'cancelled').length;
  const bothCompleted = days.filter(d => d.morning === 'completed' && d.night === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <StatCard label="Morning Done" value={completedMorning} />
        <StatCard label="Night Done" value={completedNight} />
        <StatCard label="Both Done" value={bothCompleted} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <StatCard label="Morning Cancelled" value={cancelledMorning} />
        <StatCard label="Night Cancelled" value={cancelledNight} />
        <StatCard label="Tracked Days" value={days.length} />
      </div>
      <div style={{
        padding: '12px 13px', borderRadius: 12,
        background: 'var(--card-bg-soft)',
        border: '1px solid var(--border-soft)',
        display: 'grid', gap: 4,
      }}>
        <div style={summaryRowStyle}><span>Morning Streak</span><span>{streaks.morning}d</span></div>
        <div style={summaryRowStyle}><span>Night Streak</span><span>{streaks.night}d</span></div>
        <div style={summaryRowStyle}><span>Both Streak</span><span>{streaks.both}d</span></div>
      </div>
    </div>
  );
}

function LocalSettingsTab() {
  const [backupSummary, setBackupSummary] = useState<BackupSummary>(getBackupSummary());
  const [backupMsg, setBackupMsg] = useState('');
  const [backupErr, setBackupErr] = useState('');
  const [clearConfirm, setClearConfirm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(getReminderSettings());
  const [practiceMeta, setPracticeMeta] = useState<PracticeMetaMap>(getPracticeMeta());

  const refreshBackupSummary = () => setBackupSummary(getBackupSummary());

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const handleExport = () => {
    setBackupErr('');
    setBackupMsg('');
    try {
      const json = exportAppData();
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const filename = `kundalini-sadhana-backup-${yyyy}-${mm}-${dd}.json`;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      refreshBackupSummary();
      setBackupMsg('Backup exported.');
    } catch (err) {
      setBackupErr(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  const handleImportClick = () => {
    setBackupErr('');
    setBackupMsg('');
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file: File) => {
    setBackupErr('');
    setBackupMsg('');
    try {
      const json = await file.text();
      const result = importAppData(json);
      if (result.ok) {
        refreshBackupSummary();
        setBackupMsg(`Import successful.${result.imported.trackerData ? ' Tracker restored.' : ''}${result.imported.settingsData ? ' Settings restored.' : ''}`);
      } else {
        setBackupErr(result.error ?? 'Import failed.');
      }
    } catch (err) {
      setBackupErr(err instanceof Error ? err.message : 'Import failed.');
    }
  };

  const handleClearAll = () => {
    setBackupErr('');
    setBackupMsg('');
    if (clearConfirm !== 'CLEAR') {
      setBackupErr('Type CLEAR to confirm data wipe.');
      return;
    }
    clearAllAppData();
    setClearConfirm('');
    refreshBackupSummary();
    setBackupMsg('All local app data cleared.');
  };

  const applyReminder = <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => {
    const next = updateReminderSettings({ [key]: value } as Partial<ReminderSettings>);
    setReminderSettings(next);
  };

  const allPractices = [
    ...SESSIONS.morning.practices.map((p, i) => ({ session: 'Morning', name: p.name, id: `morning:${i}:${p.name}` })),
    ...SESSIONS.night.practices.map((p, i) => ({ session: 'Night', name: p.name, id: `night:${i}:${p.name}` })),
  ];

  const patchPracticeMeta = (practiceId: string, patch: { personalNote?: string; isFavorite?: boolean; customLabel?: string }) => {
    const next = updatePracticeMeta(practiceId, patch);
    setPracticeMeta(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        padding: '1.1rem', borderRadius: 14,
        background: 'var(--card-bg-soft)',
        border: '1px solid var(--border-soft)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-accent)', marginBottom: 14 }}>
          Reminders
        </div>
        <div style={{ display: 'grid', gap: 7 }}>
          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Morning Reminder</span>
            <input type="checkbox" checked={reminderSettings.morningReminderEnabled} onChange={e => applyReminder('morningReminderEnabled', e.target.checked)} />
          </div>
          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Morning Time</span>
            <input type="time" value={reminderSettings.morningReminderTime} onChange={e => applyReminder('morningReminderTime', e.target.value)} style={{ ...inputStyle, width: 112, padding: '7px 8px' }} />
          </div>
          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Night Reminder</span>
            <input type="checkbox" checked={reminderSettings.nightReminderEnabled} onChange={e => applyReminder('nightReminderEnabled', e.target.checked)} />
          </div>
          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Night Time</span>
            <input type="time" value={reminderSettings.nightReminderTime} onChange={e => applyReminder('nightReminderTime', e.target.value)} style={{ ...inputStyle, width: 112, padding: '7px 8px' }} />
          </div>
        </div>
        <div style={{ marginTop: 12, fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          Reminder times are saved. Notification support will be added later.
        </div>
      </div>

      <div style={{
        padding: '1.1rem', borderRadius: 14,
        background: 'var(--card-bg-soft)',
        border: '1px solid var(--border-soft)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-accent)', marginBottom: 14 }}>
          Practice Personalization
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {allPractices.map(pr => {
            const meta = practiceMeta[pr.id] ?? {};
            const note = meta.personalNote ?? '';
            const label = meta.customLabel ?? '';
            const favorite = !!meta.isFavorite;
            return (
              <div key={pr.id} style={{
                padding: '10px 11px', borderRadius: 11,
                border: '1px solid var(--border-soft)',
                background: 'color-mix(in srgb, var(--card-bg-soft) 92%, transparent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: pr.session === 'Morning' ? '#D4892A' : '#6B7FBF', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {pr.session}
                  </span>
                  <span style={{ flex: 1, fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>{pr.name}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <input type="checkbox" checked={favorite} onChange={e => patchPracticeMeta(pr.id, { isFavorite: e.target.checked })} />
                    Favorite
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                  <input
                    value={label}
                    onChange={e => patchPracticeMeta(pr.id, { customLabel: e.target.value })}
                    placeholder="Custom label (optional)"
                    style={{ ...inputStyle, padding: '8px 10px', fontSize: '10px' }}
                  />
                  <div>
                    <textarea
                      value={note}
                      onChange={e => patchPracticeMeta(pr.id, { personalNote: e.target.value.slice(0, 160) })}
                      placeholder="Short personal note (max 160 chars)"
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 50, fontSize: '10px', padding: '8px 10px' }}
                    />
                    <div style={{ textAlign: 'right', marginTop: 2, fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)' }}>
                      {note.length}/160
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        padding: '1.1rem', borderRadius: 14,
        background: 'var(--card-bg-soft)',
        border: '1px solid var(--border-soft)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-accent)', marginBottom: 14 }}>
          Backup & Restore
        </div>
        <div style={{ display: 'grid', gap: 7, marginBottom: 10 }}>
          <button onClick={handleExport} style={adminActionBtnStyle}>Export Data</button>
          <button onClick={handleImportClick} style={adminActionBtnStyle}>Import Data From JSON</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.currentTarget.value = '';
            }}
          />
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'color-mix(in srgb, var(--card-bg-soft) 92%, transparent)', border: '1px solid var(--border-soft)',
          marginBottom: 10,
        }}>
          <div style={summaryRowStyle}><span>App Version</span><span>{backupSummary.appVersion}</span></div>
          <div style={summaryRowStyle}><span>Tracker Days</span><span>{backupSummary.trackerDayCount}</span></div>
          <div style={summaryRowStyle}><span>Settings Stored</span><span>{backupSummary.hasSettingsData ? 'Yes' : 'No'}</span></div>
          <div style={summaryRowStyle}><span>Last Exported</span><span>{formatDate(backupSummary.lastExportedAt)}</span></div>
          <div style={summaryRowStyle}><span>Last Imported</span><span>{formatDate(backupSummary.lastImportedAt)}</span></div>
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          border: '1px solid rgba(220,80,80,0.2)', background: 'rgba(220,80,80,0.07)',
        }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E07070', marginBottom: 8 }}>
            Danger Zone
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#8A6A6A', marginBottom: 8, lineHeight: 1.6 }}>
            This removes local tracker and settings data. Type <strong>CLEAR</strong> to confirm.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={clearConfirm} onChange={e => setClearConfirm(e.target.value)} placeholder="Type CLEAR" style={{ ...inputStyle, margin: 0, flex: 1, borderColor: 'rgba(220,80,80,0.24)', color: '#E6C8C8' }} />
            <button onClick={handleClearAll} style={{ ...adminActionBtnStyle, minWidth: 110, borderColor: 'rgba(220,80,80,0.3)', color: '#E07070', background: 'rgba(220,80,80,0.12)' }}>
              Clear All App Data
            </button>
          </div>
        </div>
        {(backupMsg || backupErr) && (
          <div style={{ marginTop: 10, fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: backupErr ? '#E07070' : '#70C070' }}>
            {backupErr || backupMsg}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      flex: 1, padding: '0.95rem', borderRadius: 14,
      background: 'var(--card-bg-soft)',
      border: '1px solid var(--border-soft)',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', color: 'var(--gold-accent)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--field-bg)', border: '1px solid var(--field-border)',
  borderRadius: 9, color: 'var(--field-text)',
  fontFamily: "'Raleway', sans-serif", fontSize: '11px', fontWeight: 300,
  outline: 'none',
};

const adminActionBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'var(--button-ghost-bg)',
  border: '1px solid var(--border-soft)',
  color: 'var(--gold-accent)',
  cursor: 'pointer',
  fontFamily: "'Raleway', sans-serif",
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  fontFamily: "'Raleway', sans-serif",
  fontSize: '9px',
  color: 'var(--text-muted)',
  marginBottom: 4,
};

const settingsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '9px 10px',
  borderRadius: 11,
  border: '1px solid var(--border-soft)',
  background: 'color-mix(in srgb, var(--card-bg-soft) 92%, transparent)',
};

const settingsLabelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: '9px',
  color: 'var(--text-muted)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
