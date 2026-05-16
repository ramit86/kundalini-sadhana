import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BarChart2, Settings, Music, RefreshCw, Trash2, Plus, Check, Lock } from 'lucide-react';
import { supabase, DailyCompletion, CustomAudio } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { SESSIONS } from '../data/sessions';
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

type Tab = 'stats' | 'audio' | 'settings';

export default function AdminScreen({ onBack }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('stats');
  const [completions, setCompletions] = useState<(DailyCompletion & { profiles?: { display_name: string } })[]>([]);
  const [customAudio, setCustomAudio] = useState<CustomAudio[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  // New audio form
  const [newAudio, setNewAudio] = useState({ session_key: 'morning', practice_name: '', audio_type: 'ambient' as 'voice' | 'ambient', label: '', url: '' });
  const [audioSaving, setAudioSaving] = useState(false);
  const [audioMsg, setAudioMsg] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: comp }, { data: audio }, { data: sets }] = await Promise.all([
      supabase.from('daily_completions').select('*, profiles(display_name)').order('date', { ascending: false }).limit(200),
      supabase.from('custom_audio').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_settings').select('*'),
    ]);
    setCompletions((comp ?? []) as any);
    setCustomAudio(audio ?? []);
    const settingsMap: Record<string, unknown> = {};
    sets?.forEach(s => { settingsMap[s.key] = s.value; });
    setSettings(settingsMap);
    setLoading(false);
  };

  const deleteAudio = async (id: string) => {
    await supabase.from('custom_audio').delete().eq('id', id);
    setCustomAudio(prev => prev.filter(a => a.id !== id));
  };

  const addAudio = async () => {
    if (!newAudio.label || !newAudio.url || !newAudio.practice_name) { setAudioMsg('Fill all fields.'); return; }
    setAudioSaving(true);
    const { data, error } = await supabase.from('custom_audio').insert({
      ...newAudio, created_by: user!.id,
    }).select().maybeSingle();
    setAudioSaving(false);
    if (error) { setAudioMsg(error.message); return; }
    if (data) setCustomAudio(prev => [data, ...prev]);
    setNewAudio({ session_key: 'morning', practice_name: '', audio_type: 'ambient', label: '', url: '' });
    setAudioMsg('Added successfully.');
    setTimeout(() => setAudioMsg(''), 3000);
  };

  const gold = '#C8A96E';
  const { profile, refreshProfile } = useAuth();
  const [makingAdmin, setMakingAdmin] = useState(false);

  const enableAdmin = async () => {
    if (!user) return;
    setMakingAdmin(true);
    await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
    await refreshProfile();
    setMakingAdmin(false);
    loadAll();
  };

  // Summary stats
  const totalUsers = new Set(completions.map(c => c.user_id)).size;
  const totalCompleted = completions.filter(c => !c.cancelled).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = completions.filter(c => c.date === todayStr && !c.cancelled).length;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0C0A07 0%, #080604 100%)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.4rem 0.85rem',
        borderBottom: '1px solid rgba(200,169,110,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(200,169,110,0.14)',
          background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
          color: '#8A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={14} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, opacity: 0.7, marginBottom: 2 }}>
            Admin
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 300, color: '#EDE5DA' }}>
            Control Panel
          </div>
        </div>
        <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A4038', padding: 4 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid rgba(200,169,110,0.07)',
        flexShrink: 0,
      }}>
        {([['stats', <BarChart2 size={12} />, 'Statistics'], ['audio', <Music size={12} />, 'Audio'], ['settings', <Settings size={12} />, 'Settings']] as [Tab, React.ReactNode, string][]).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t ? `2px solid ${gold}` : '2px solid transparent',
            color: tab === t ? gold : '#4A4038',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: "'Raleway', sans-serif", fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.2rem' }}>
        {!profile?.is_admin ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(200,169,110,0.15)', background: 'rgba(200,169,110,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={22} color="rgba(200,169,110,0.5)" strokeWidth={1.2} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#EDE5DA' }}>Admin Access</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: '#5A5040', lineHeight: 1.7, maxWidth: 280 }}>
              Enable admin mode to view statistics, manage custom audio, and configure app settings.
            </div>
            <button onClick={enableAdmin} disabled={makingAdmin} style={{ padding: '11px 28px', borderRadius: 22, border: '1px solid rgba(200,169,110,0.3)', background: 'rgba(200,169,110,0.1)', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A96E', transition: 'all 0.2s' }}>
              {makingAdmin ? 'Enabling…' : 'Enable Admin'}
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', paddingTop: '3rem', color: '#3A3028', fontFamily: "'Raleway', sans-serif", fontSize: '11px' }}>Loading…</div>
        ) : tab === 'stats' ? (
          <StatsTab completions={completions as any} totalUsers={totalUsers} totalCompleted={totalCompleted} todayCount={todayCount} />
        ) : tab === 'audio' ? (
          <AudioTab
            customAudio={customAudio}
            newAudio={newAudio}
            setNewAudio={setNewAudio}
            onAdd={addAudio}
            onDelete={deleteAudio}
            saving={audioSaving}
            msg={audioMsg}
          />
        ) : (
          <SettingsTab settings={settings} userId={user!.id} onRefresh={loadAll} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      flex: 1, padding: '0.85rem', borderRadius: 12,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(200,169,110,0.07)',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', color: '#C8A96E', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#4A4038', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#3A3028', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatsTab({ completions, totalUsers, totalCompleted, todayCount }: any) {
  const morningCount = completions.filter((c: any) => c.session_key === 'morning' && !c.cancelled).length;
  const nightCount = completions.filter((c: any) => c.session_key === 'night' && !c.cancelled).length;
  const cancelCount = completions.filter((c: any) => c.cancelled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <StatCard label="Users" value={totalUsers} />
        <StatCard label="Completed" value={totalCompleted} />
        <StatCard label="Today" value={todayCount} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <StatCard label="Morning" value={morningCount} />
        <StatCard label="Night" value={nightCount} />
        <StatCard label="Cancelled" value={cancelCount} />
      </div>

      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3A3028', marginTop: 4 }}>
        Recent Activity
      </div>
      {completions.slice(0, 30).map((c: any, i: number) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 10,
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(200,169,110,0.05)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: c.cancelled ? '#E07070' : c.session_key === 'morning' ? '#D4892A' : '#6B7FBF',
            boxShadow: c.cancelled ? 'none' : `0 0 5px ${c.session_key === 'morning' ? '#D4892A' : '#6B7FBF'}66`,
          }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#8A7A6A' }}>
              {c.profiles?.display_name || 'User'}
            </span>
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#3A3028', marginLeft: 6 }}>
              {c.session_key} · {c.date}
            </span>
          </div>
          {c.cancelled ? (
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#E07070', letterSpacing: '0.1em' }}>Cancelled</span>
          ) : (
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#4A4038' }}>
              {c.practices_completed}p · {c.minutes_completed}m
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function AudioTab({ customAudio, newAudio, setNewAudio, onAdd, onDelete, saving, msg }: any) {
  const allPractices = [
    ...SESSIONS.morning.practices.map(p => ({ session: 'morning', name: p.name })),
    ...SESSIONS.night.practices.map(p => ({ session: 'night', name: p.name })),
  ];
  const practiceOptions = allPractices.filter(p => p.session === newAudio.session_key);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        padding: '1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,110,0.08)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4A4038', marginBottom: 12 }}>
          Add Custom Audio
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={newAudio.session_key} onChange={e => setNewAudio({ ...newAudio, session_key: e.target.value, practice_name: '' })} style={selectStyle}>
              <option value="morning">Morning</option>
              <option value="night">Night</option>
            </select>
            <select value={newAudio.audio_type} onChange={e => setNewAudio({ ...newAudio, audio_type: e.target.value })} style={selectStyle}>
              <option value="ambient">Ambient</option>
              <option value="voice">Voice</option>
            </select>
          </div>
          <select value={newAudio.practice_name} onChange={e => setNewAudio({ ...newAudio, practice_name: e.target.value })} style={selectStyle}>
            <option value="">Select practice…</option>
            {practiceOptions.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <input placeholder="Label (e.g. Tibetan Bowls)" value={newAudio.label} onChange={e => setNewAudio({ ...newAudio, label: e.target.value })} style={inputStyle} />
          <input placeholder="Audio URL (https://…)" value={newAudio.url} onChange={e => setNewAudio({ ...newAudio, url: e.target.value })} style={inputStyle} />
          {msg && <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: msg.includes('success') ? '#70C070' : '#E07070' }}>{msg}</div>}
          <button onClick={onAdd} disabled={saving} style={{
            padding: '10px', borderRadius: 10,
            background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)',
            color: '#C8A96E', cursor: 'pointer', fontFamily: "'Raleway', sans-serif",
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Plus size={12} /> {saving ? 'Saving…' : 'Add Audio'}
          </button>
        </div>
      </div>

      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3A3028' }}>
        Saved Audio ({customAudio.length})
      </div>
      {customAudio.map((a: CustomAudio) => (
        <div key={a.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(200,169,110,0.05)',
        }}>
          <Music size={11} color={a.audio_type === 'ambient' ? '#6B7FBF' : '#D4892A'} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#8A7A6A' }}>{a.label}</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#4A4038', marginTop: 1 }}>{a.session_key} · {a.practice_name} · {a.audio_type}</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#3A3028', marginTop: 1, wordBreak: 'break-all' }}>{a.url.slice(0, 50)}…</div>
          </div>
          <button onClick={() => onDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A3028', padding: 4 }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      {customAudio.length === 0 && (
        <div style={{ textAlign: 'center', fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: '#3A3028', padding: '1.5rem' }}>
          No custom audio added yet.
        </div>
      )}
    </div>
  );
}

function SettingsTab({ settings, userId, onRefresh }: { settings: Record<string, unknown>; userId: string; onRefresh: () => void }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [backupSummary, setBackupSummary] = useState<BackupSummary>(getBackupSummary());
  const [backupMsg, setBackupMsg] = useState('');
  const [backupErr, setBackupErr] = useState('');
  const [clearConfirm, setClearConfirm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(getReminderSettings());
  const [practiceMeta, setPracticeMeta] = useState<PracticeMetaMap>(getPracticeMeta());

  const refreshBackupSummary = () => {
    setBackupSummary(getBackupSummary());
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const save = async () => {
    if (!key) return;
    setSaving(true);
    let parsed: unknown = value;
    try { parsed = JSON.parse(value); } catch (_) {}
    const { error } = await supabase.from('admin_settings').upsert({
      key, value: parsed as any, updated_by: userId, updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    setSaving(false);
    if (error) setMsg(error.message);
    else { setMsg('Saved.'); setKey(''); setValue(''); onRefresh(); setTimeout(() => setMsg(''), 2000); }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        padding: '1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,110,0.08)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4A4038', marginBottom: 12 }}>
          Add / Update Setting
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Key (e.g. theme_accent)" value={key} onChange={e => setKey(e.target.value)} style={inputStyle} />
          <input placeholder='Value (string or JSON, e.g. "#FF6600")' value={value} onChange={e => setValue(e.target.value)} style={inputStyle} />
          {msg && <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#70C070' }}>{msg}</div>}
          <button onClick={save} disabled={saving} style={{
            padding: '10px', borderRadius: 10,
            background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)',
            color: '#C8A96E', cursor: 'pointer', fontFamily: "'Raleway', sans-serif",
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Check size={12} /> {saving ? 'Saving…' : 'Save Setting'}
          </button>
        </div>
      </div>

      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3A3028' }}>
        Current Settings
      </div>
      {Object.entries(settings).map(([k, v]) => (
        <div key={k} style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(200,169,110,0.05)',
        }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#C8A96E' }}>{k}</div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#5A5040', marginTop: 2, wordBreak: 'break-all' }}>
            {JSON.stringify(v)}
          </div>
        </div>
      ))}
      {Object.keys(settings).length === 0 && (
        <div style={{ textAlign: 'center', fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: '#3A3028', padding: '1.5rem' }}>
          No settings configured.
        </div>
      )}

      <div style={{
        padding: '1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,110,0.1)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 12 }}>
          Reminders
        </div>

        <div style={{ display: 'grid', gap: 7 }}>
          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Morning Reminder</span>
            <input
              type="checkbox"
              checked={reminderSettings.morningReminderEnabled}
              onChange={e => applyReminder('morningReminderEnabled', e.target.checked)}
            />
          </div>

          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Morning Time</span>
            <input
              type="time"
              value={reminderSettings.morningReminderTime}
              onChange={e => applyReminder('morningReminderTime', e.target.value)}
              style={{ ...inputStyle, width: 112, padding: '7px 8px' }}
            />
          </div>

          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Night Reminder</span>
            <input
              type="checkbox"
              checked={reminderSettings.nightReminderEnabled}
              onChange={e => applyReminder('nightReminderEnabled', e.target.checked)}
            />
          </div>

          <div style={settingsRowStyle}>
            <span style={settingsLabelStyle}>Night Time</span>
            <input
              type="time"
              value={reminderSettings.nightReminderTime}
              onChange={e => applyReminder('nightReminderTime', e.target.value)}
              style={{ ...inputStyle, width: 112, padding: '7px 8px' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 10, fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#7C6E5E', lineHeight: 1.6 }}>
          Reminder times are saved. Notification support will be added later.
        </div>
      </div>

      <div style={{
        padding: '1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,110,0.1)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 12 }}>
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
                padding: '9px 10px', borderRadius: 10,
                border: '1px solid rgba(200,169,110,0.08)',
                background: 'rgba(255,255,255,0.015)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: pr.session === 'Morning' ? '#D4892A' : '#6B7FBF', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {pr.session}
                  </span>
                  <span style={{ flex: 1, fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#BBA98E' }}>{pr.name}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#9A8A74', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <input
                      type="checkbox"
                      checked={favorite}
                      onChange={e => patchPracticeMeta(pr.id, { isFavorite: e.target.checked })}
                    />
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
                    <div style={{ textAlign: 'right', marginTop: 2, fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: '#6C5F52' }}>
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
        padding: '1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,110,0.1)',
      }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 12 }}>
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
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(200,169,110,0.07)',
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
            <input
              value={clearConfirm}
              onChange={e => setClearConfirm(e.target.value)}
              placeholder="Type CLEAR"
              style={{ ...inputStyle, margin: 0, flex: 1, borderColor: 'rgba(220,80,80,0.24)', color: '#E6C8C8' }}
            />
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,169,110,0.1)',
  borderRadius: 8, color: '#C8B89A',
  fontFamily: "'Raleway', sans-serif", fontSize: '11px', fontWeight: 300,
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, flex: 1, cursor: 'pointer',
};

const adminActionBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(200,169,110,0.08)',
  border: '1px solid rgba(200,169,110,0.2)',
  color: '#C8A96E',
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
  color: '#8A7A6A',
  marginBottom: 4,
};

const settingsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(200,169,110,0.08)',
  background: 'rgba(255,255,255,0.015)',
};

const settingsLabelStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: '9px',
  color: '#BBA98E',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
