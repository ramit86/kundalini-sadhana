import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, Clock3, Sparkles } from 'lucide-react';
import { getMonthTrackerData, TrackerDay } from '../lib/tracker';
import { getMonthlyComparison, getSessionHistoryForMonth } from '../store/sessionHistoryStore';
import { getSadhanaProfile } from '../store/profileStore';
import { getStreaks } from '../lib/tracker';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getLocalDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PracticeJourneyPanel() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const profile = getSadhanaProfile();
  const reference = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);
  const monthData = useMemo(() => getMonthTrackerData(reference.getFullYear(), reference.getMonth()), [reference]);
  const monthHistory = useMemo(() => getSessionHistoryForMonth(reference.getFullYear(), reference.getMonth()), [reference]);
  const comparison = useMemo(() => getMonthlyComparison(reference), [reference]);
  const streaks = getStreaks();
  const todayKey = getLocalDateKey();

  const sortedDays = [...monthData.days];
  const selected = selectedDate ?? (sortedDays.find(day => day.date === todayKey)?.date ?? sortedDays[sortedDays.length - 1]?.date ?? '');
  const selectedDay = sortedDays.find(day => day.date === selected) ?? null;
  const selectedHistory = monthHistory.filter(entry => entry.completedAt.slice(0, 10) === selected);

  useEffect(() => {
    const todayKey = getLocalDateKey();
    if (monthData.days.some(day => day.date === selectedDate)) return;
    setSelectedDate(monthData.days.find(day => day.date === todayKey)?.date ?? monthData.days[0]?.date ?? null);
  }, [monthData.days, selectedDate]);

  const completedDays = sortedDays.filter(day => day.date <= todayKey && (day.morning === 'completed' || day.night === 'completed')).length;
  const missedDays = sortedDays.filter(day => day.date <= todayKey && day.morning === 'not_started' && day.night === 'not_started').length;
  const totalMinutes = monthHistory.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const morningSessions = monthHistory.filter(entry => entry.sessionKey === 'morning').length;
  const nightSessions = monthHistory.filter(entry => entry.sessionKey === 'night').length;

  const monthLabel = reference.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const offset = new Date(reference.getFullYear(), reference.getMonth(), 1).getDay();
  const daysInMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '1rem',
      borderRadius: 18,
      background: 'var(--card-bg-soft)',
      border: '1px solid var(--border-soft)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-accent)', marginBottom: 3 }}>
            Practice Journey
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            {profile.displayName}
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
            {profile.practiceWindow === 'custom'
              ? profile.customPracticeWindowLabel || 'Custom practice window'
              : profile.practiceWindow.replace(/_/g, ' ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <MonthNavButton onClick={() => setMonthOffset(v => v - 1)}><ChevronLeft size={12} /></MonthNavButton>
          <MonthNavButton onClick={() => setMonthOffset(v => v + 1)}><ChevronRight size={12} /></MonthNavButton>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
        gap: 8,
      }}>
        <MiniStat icon={<Sun size={11} />} label="Days Practised" value={completedDays} />
        <MiniStat icon={<Clock3 size={11} />} label="Total Time" value={`${totalMinutes}m`} />
        <MiniStat icon={<Moon size={11} />} label="Morning / Evening" value={`${morningSessions}/${nightSessions}`} />
        <MiniStat icon={<Sparkles size={11} />} label="Longest Streak" value={`${Math.max(streaks.morning, streaks.night, streaks.both)}d`} />
      </div>

      <div style={{
        padding: '0.85rem',
        borderRadius: 16,
        border: '1px solid var(--border-soft)',
        background: 'color-mix(in srgb, var(--card-bg) 55%, transparent)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
        }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
            {monthLabel}
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
            {daysInMonth} days
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}>
          {WEEKDAY_LABELS.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '7.5px',
              letterSpacing: '0.12em',
              color: 'var(--text-subtle)',
            }}>
              {d}
            </div>
          ))}
          {Array.from({ length: offset }, (_, idx) => <div key={`offset-${idx}`} />)}
          {sortedDays.map(day => {
            const hasSession = day.morning === 'completed' || day.night === 'completed';
            const isToday = day.date === new Date().toISOString().slice(0, 10);
            const isSelected = selected === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  padding: 4,
                  border: `1px solid ${isSelected ? 'var(--gold-accent)' : isToday ? 'var(--card-border)' : 'var(--border-soft)'}`,
                  background: hasSession ? 'color-mix(in srgb, var(--gold-accent) 7%, transparent)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '7px',
                  color: isToday ? 'var(--gold-accent)' : 'var(--text-subtle)',
                  letterSpacing: '0.04em',
                }}>
                  {new Date(day.date + 'T00:00:00').getDate()}
                </span>
                <DayDots day={day} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
      }}>
        <div style={{
          padding: '0.9rem',
          borderRadius: 16,
          border: '1px solid var(--border-soft)',
          background: 'var(--card-bg-soft)',
        }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 8 }}>
            Session History{selectedDay ? ` · ${new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
          </div>
          {selectedHistory.length > 0 ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {selectedHistory.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 12,
                  border: '1px solid var(--border-soft)',
                  background: 'color-mix(in srgb, var(--card-bg) 75%, transparent)',
                }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {entry.sessionLabel}
                    </div>
                    <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                      {entry.practiceCount} practices · {entry.outcome}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--gold-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {entry.durationMinutes} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-subtle)', lineHeight: 1.7 }}>
              Select a day to review completed practice. The calendar preserves completed and missed days without pressure.
            </div>
          )}
        </div>

        <div style={{
          padding: '0.9rem',
          borderRadius: 16,
          border: '1px solid var(--border-soft)',
          background: 'color-mix(in srgb, var(--card-bg) 76%, transparent)',
          display: 'grid',
          gap: 10,
          alignContent: 'start',
        }}>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
            Gentle Recovery
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
            If a day was missed, return to the next practice without effort. The journey stays intact.
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.7 }}>
            This month: {comparison.currentSessions} sessions · {comparison.currentMinutes} minutes
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.7 }}>
            Compared with last month: {comparison.minuteDelta >= 0 ? '+' : ''}{comparison.minuteDelta} minutes
          </div>
          <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '8px', color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.7 }}>
            Completed days in view: {completedDays} · Missed days: {missedDays}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayDots({ day }: { day: TrackerDay }) {
  const items = [
    { active: day.morning === 'completed', label: 'Morning', color: '#D4892A' },
    { active: day.night === 'completed', label: 'Night', color: '#6B7FBF' },
  ];
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {items.map(item => (
        <span
          key={item.label}
          title={item.label}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: item.active ? item.color : 'rgba(255,255,255,0.07)',
            boxShadow: item.active ? `0 0 4px ${item.color}77` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 11px',
      borderRadius: 14,
      border: '1px solid var(--border-soft)',
      background: 'var(--card-bg-soft)',
      display: 'grid',
      gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold-accent)' }}>
        {icon}
        <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function MonthNavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        border: '1px solid var(--border-soft)',
        background: 'var(--button-ghost-bg)',
        color: 'var(--text-subtle)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
