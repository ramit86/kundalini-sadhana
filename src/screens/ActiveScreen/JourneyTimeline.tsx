import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { Session } from '../../data/sessions';

interface PracticeState {
  timeRemaining: number;
  completed: boolean;
}

interface Props {
  session: Session;
  practiceIndex: number;
  practiceStates: Record<number, PracticeState>;
  onOpenPractice: (idx: number) => void;
  isMobile: boolean;
}

export default function JourneyTimeline({ session, practiceIndex, practiceStates, onOpenPractice, isMobile }: Props) {
  const completedCount = session.practices.filter((_, idx) => idx < practiceIndex || practiceStates[idx]?.completed).length;

  return (
    <div style={{
      padding: '0.2rem 0.65rem 0.15rem',
      flexShrink: 0,
      position: 'relative',
      zIndex: 2,
      width: '100%',
      maxWidth: '100vw',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
        }}>
          Journey Timeline
        </div>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '7.5px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
        }}>
          {completedCount} completed
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {session.practices.map((practice, idx) => {
          const state = practiceStates[idx];
          const isCurrent = idx === practiceIndex;
          const isCompleted = state?.completed === true || idx < practiceIndex;
          const canOpen = isCompleted && !isCurrent;
          const label = isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Upcoming';
          const icon = isCurrent
            ? <Circle size={10} fill="currentColor" />
            : isCompleted
              ? <CheckCircle2 size={10} />
              : <Lock size={10} />;
          return (
              <button
              key={`${practice.name}-${idx}`}
              disabled={!canOpen}
              onClick={() => canOpen && onOpenPractice(idx)}
              aria-label={`${label} practice ${idx + 1}: ${practice.name}`}
              style={{
                minWidth: isMobile ? 112 : 132,
                flexShrink: 0,
                borderRadius: 14,
                padding: isMobile ? '9px 10px' : '10px 11px',
                border: `1px solid ${isCurrent ? 'var(--gold-accent)' : isCompleted ? 'var(--border-soft)' : 'transparent'}`,
                background: isCurrent
                  ? 'var(--button-ghost-bg)'
                  : isCompleted
                    ? 'var(--card-bg-soft)'
                    : 'color-mix(in srgb, var(--card-bg-soft) 68%, transparent)',
                cursor: canOpen ? 'pointer' : 'default',
                opacity: isCompleted || isCurrent ? 1 : 0.58,
                textAlign: 'left',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'Raleway', sans-serif",
                fontSize: '7.5px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: isCurrent ? 'var(--gold-accent)' : 'var(--text-subtle)',
                marginBottom: 6,
              }}>
                {icon}
                {label}
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.93rem',
                color: 'var(--text-primary)',
                lineHeight: 1.18,
                marginBottom: 4,
              }}>
                {practice.name}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                fontFamily: "'Raleway', sans-serif",
                fontSize: '7.5px',
                color: 'var(--text-subtle)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                <span>Practice {idx + 1}</span>
                <span>{Math.max(1, Math.round(practice.duration / 60))} min</span>
              </div>
              {isCurrent && (
                <div style={{
                  marginTop: 8,
                  height: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--gold-accent), rgba(200,169,110,0.25))',
                }} />
              )}
              {!isCurrent && isCompleted && (
                <div style={{
                  marginTop: 8,
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '7px',
                  color: 'var(--text-subtle)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Tap to revisit
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: 7,
        fontFamily: "'Raleway', sans-serif",
        fontSize: '7.5px',
        color: 'var(--text-subtle)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Revisiting completed practices does not change the resume point.
      </div>
    </div>
  );
}
