import { Check, X, Sun, Moon } from 'lucide-react';
import { getTrackerData } from '../lib/tracker';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DailyTracker() {
  const { days, streaks } = getTrackerData(28);
  const dates = days.map(d => d.date);

  return (
    <div style={{ width: '100%', padding: '0 0.2rem' }}>
      {/* Streaks */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <StreakBadge icon={<Sun size={11} />} label="Morning" streak={streaks.morning} color="#D4892A" />
        <StreakBadge icon={<Moon size={11} />} label="Night" streak={streaks.night} color="#6B7FBF" />
        <StreakBadge icon={<Check size={11} />} label="Both" streak={streaks.both} color="#C8A96E" />
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {/* Day labels */}
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '7.5px', letterSpacing: '0.1em',
            color: 'var(--text-subtle)', paddingBottom: 2,
          }}>{d}</div>
        ))}

        {/* Offset for first day of the 4-week window */}
        {Array.from({ length: new Date(dates[0]).getDay() }, (_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {dates.map(date => {
          const status = days.find(d => d.date === date);
          const mDone = status?.morning === 'completed';
          const nDone = status?.night === 'completed';
          const mCancel = status?.morning === 'cancelled';
          const nCancel = status?.night === 'cancelled';
          const isToday = date === days[days.length - 1]?.date;

          return (
            <div key={date} style={{
              aspectRatio: '1',
              borderRadius: 6,
              border: isToday ? '1px solid var(--card-border)' : '1px solid var(--border-soft)',
              background: (mDone && nDone) ? 'var(--card-bg-soft)' : 'var(--card-bg-soft)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 1.5, padding: 2,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Day number */}
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '7px', color: isToday ? 'var(--gold-accent)' : 'var(--text-subtle)',
                lineHeight: 1, letterSpacing: '0.04em',
              }}>
                {new Date(date + 'T00:00:00').getDate()}
              </span>

              {/* Morning dot */}
              <SessionDot done={!!mDone} cancelled={!!mCancel} color="#D4892A" size={4} />
              {/* Night dot */}
              <SessionDot done={!!nDone} cancelled={!!nCancel} color="#6B7FBF" size={4} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center' }}>
        <LegendItem color="#D4892A" label="Morning" />
        <LegendItem color="#6B7FBF" label="Night" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--card-bg-soft)', border: '1px solid var(--border-soft)' }} />
          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)' }}>Missed</span>
        </div>
      </div>
    </div>
  );
}

function SessionDot({ done, cancelled, color, size }: { done: boolean; cancelled: boolean; color: string; size: number }) {
  if (done) return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, boxShadow: `0 0 4px ${color}88`,
    }} />
  );
  if (cancelled) return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `0.5px solid ${color}55`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={size - 1} color={color} strokeWidth={2.5} style={{ opacity: 0.6 }} />
      </div>
    </div>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
    }} />
  );
}

function StreakBadge({ icon, label, streak, color }: { icon: React.ReactNode; label: string; streak: number; color: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', borderRadius: 10,
      background: streak > 0 ? `${color}10` : 'var(--card-bg-soft)',
      border: `1px solid ${streak > 0 ? color + '28' : 'var(--border-soft)'}`,
    }}>
      <span style={{ color: streak > 0 ? color : 'var(--text-subtle)' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: streak > 0 ? color : 'var(--text-primary)', lineHeight: 1 }}>
          {streak} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>day streak</span>
        </div>
      </div>
      {streak > 0 && (
        <Check size={13} color={color} strokeWidth={2} />
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}66` }} />
      <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)' }}>{label}</span>
    </div>
  );
}
