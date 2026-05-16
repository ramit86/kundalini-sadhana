import { useState } from 'react';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { Session, CHAKRA_MAP } from '../data/sessions';

interface Props {
  session: Session;
  onBack: () => void;
  onBegin: () => void;
}

export default function OverviewScreen({ session, onBack, onBegin }: Props) {
  const totalMins = Math.round(session.practices.reduce((s, p) => s + p.duration, 0) / 60);
  const isMorning = session.key === 'morning';
  const accentColor = isMorning ? '#D4892A' : '#6B7FBF';
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0C0A07 0%, #0A0806 100%)',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${accentColor}09 0%, transparent 65%)`,
        top: '5%', left: '50%', transform: 'translate(-50%, 0)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: '1rem 1.4rem 0.85rem',
        borderBottom: '1px solid rgba(200,169,110,0.07)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          border: '1px solid rgba(200,169,110,0.14)',
          background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
          color: '#8A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <ArrowLeft size={15} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '9px', letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: accentColor, marginBottom: 3,
            fontFamily: "'Raleway', sans-serif", fontWeight: 400, opacity: 0.8,
          }}>
            {session.label} Session
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.4rem', fontWeight: 300, color: '#EDE5DA',
          }}>
            Session Overview
          </div>
        </div>

        <button onClick={onBegin} style={{
          padding: '9px 20px', borderRadius: 22,
          border: `1px solid ${accentColor}66`,
          background: `${accentColor}14`,
          color: '#EDE5DA',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '10px', fontWeight: 500,
          letterSpacing: '0.16em', cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.22s ease',
          textTransform: 'uppercase',
        }}>
          Begin
        </button>
      </div>

      {/* Summary strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: '0.65rem 1.4rem',
        borderBottom: '1px solid rgba(200,169,110,0.05)',
        flexShrink: 0, position: 'relative', zIndex: 1,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={11} color={accentColor} strokeWidth={1.5} />
          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#5A5040', letterSpacing: '0.06em', fontWeight: 300 }}>
            {totalMins} min
          </span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(200,169,110,0.09)' }} />
        <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#5A5040', letterSpacing: '0.06em', fontWeight: 300 }}>
          {session.practices.length} practices
        </span>
        <div style={{ width: 1, height: 14, background: 'rgba(200,169,110,0.09)' }} />
        <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#5A5040', letterSpacing: '0.06em', fontWeight: 300 }}>
          Tap to preview
        </span>
      </div>

      {/* Practice list */}
      <div className="overview-list" style={{
        flex: 1, overflowY: 'auto',
        padding: '0.5rem 1.2rem 1.4rem',
        position: 'relative', zIndex: 1,
      }}>
        {session.practices.map((p, i) => {
          const cc = CHAKRA_MAP[p.chakra] ?? CHAKRA_MAP['Preparation'];
          const mins = Math.floor(p.duration / 60);
          const secs = p.duration % 60;
          const isExp = expanded === i;

          return (
            <button
              key={i}
              onClick={() => setExpanded(isExp ? null : i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '0.85rem 0.6rem',
                borderBottom: '1px solid rgba(200,169,110,0.05)',
                width: '100%', textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(200,169,110,0.05)',
                cursor: 'pointer',
              }}
            >
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 3 }}>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: '#3A3028', letterSpacing: '0.06em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: cc.dot, boxShadow: `0 0 5px ${cc.dot}55`,
                }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.05rem', color: '#DDD5C8',
                  lineHeight: 1.25, marginBottom: 5,
                }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#4A4038', fontWeight: 300 }}>
                    {mins}{secs > 0 ? `:${String(secs).padStart(2, '0')}` : ''} min
                  </span>
                  <span style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: '9.5px', letterSpacing: '0.06em',
                    padding: '2px 9px', borderRadius: 10,
                    background: cc.bg, color: cc.text,
                    border: `1px solid ${cc.dot}33`,
                  }}>
                    {p.chakra}
                  </span>
                </div>

                {isExp && (
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: '11px', color: '#6B5E50',
                      lineHeight: 1.7,
                      animation: 'fadeIn 0.25s ease',
                      borderLeft: `2px solid ${cc.dot}40`,
                      paddingLeft: 10,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: p.instruction.length > 200
                        ? p.instruction.substring(0, 200) + '…'
                        : p.instruction,
                    }}
                  />
                )}
              </div>

              <ChevronRight
                size={13}
                color="rgba(200,169,110,0.2)"
                style={{
                  flexShrink: 0, marginTop: 4,
                  transform: isExp ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.22s ease',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '0.8rem',
        fontFamily: "'Raleway', sans-serif",
        fontSize: '9px', color: '#3A3028',
        letterSpacing: '0.18em',
        borderTop: '1px solid rgba(200,169,110,0.05)',
        flexShrink: 0, position: 'relative', zIndex: 1,
        paddingBottom: 'calc(0.8rem + env(safe-area-inset-bottom, 0px))',
        textTransform: 'uppercase',
      }}>
        Total {totalMins} minutes · {session.practices.length} practices
      </div>
    </div>
  );
}
