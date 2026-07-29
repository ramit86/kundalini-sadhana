import { ChevronDown, ChevronUp } from 'lucide-react';
import { ChakraKey } from '../../data/sessions';
import { CHAKRA_INFO } from '../../data/chakraInfo';
import InfoChip from './InfoChip';
import { CHAKRA_SHORT_MEANING, CHAKRA_SPIRITUAL_BENEFITS } from './chakraCopy';

interface Props {
  chakra: ChakraKey | undefined;
  chakraColor: string;
  open: boolean;
  onToggle: () => void;
}

export default function ChakraReflectionPanel({ chakra, chakraColor, open, onToggle }: Props) {
  const key = chakra ?? 'Preparation';
  const chakraMeta = CHAKRA_INFO[key];
  if (!chakraMeta) return null;

  const spiritualBenefits = CHAKRA_SPIRITUAL_BENEFITS[key] ?? [];

  return (
    <div style={{
      marginTop: 10,
      borderRadius: 12,
      border: '1px solid color-mix(in srgb, var(--border-soft) 65%, transparent)',
      background: 'var(--card-bg-soft)',
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          border: 'none',
          borderBottom: open ? '1px solid var(--border-soft)' : 'none',
          background: 'transparent',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 10px',
          cursor: 'pointer',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: chakraColor, boxShadow: `0 0 8px ${chakraColor}88` }} />
        Chakra Reflection
        <span style={{ flex: 1 }} />
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div style={{ padding: '0.82rem 0.82rem 0.86rem', animation: 'fadeIn 0.25s ease both' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <InfoChip label="Chakra" value={chakraMeta.displayName} color={chakraColor} />
            <InfoChip label="Location" value={chakraMeta.bodyLocation} color={chakraColor} />
            <InfoChip label="Element" value={chakraMeta.element} color={chakraColor} />
            <InfoChip label="Bija" value={chakraMeta.bijaMantra || '—'} color={chakraColor} />
          </div>
          <p style={{ margin: '0 0 7px', fontFamily: "'Raleway', sans-serif", fontSize: '10.5px', lineHeight: 1.65, color: 'var(--text-muted)' }}>
            {CHAKRA_SHORT_MEANING[key] ?? chakraMeta.spiritualMeaning.split('.')[0]}
          </p>
          {spiritualBenefits.length > 0 && (
            <div style={{ display: 'grid', gap: 4 }}>
              {spiritualBenefits.slice(0, 3).map((b, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span style={{ width: 5, height: 5, marginTop: 6, borderRadius: '50%', background: chakraColor, opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
