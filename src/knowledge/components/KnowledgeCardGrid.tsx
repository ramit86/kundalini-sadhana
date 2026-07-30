import { BookOpen, Lock, Sparkles } from 'lucide-react';
import { GuideCard } from '../models/knowledge';

interface Props {
  cards: GuideCard[];
  selectedId: string;
  onSelect: (card: GuideCard) => void;
}

export default function KnowledgeCardGrid({ cards, selectedId, onSelect }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: 10,
    }}>
      {cards.map(card => {
        const isSelected = card.id === selectedId;
        const isAvailable = card.status === 'available';
        return (
          <button
            key={card.id}
            onClick={() => onSelect(card)}
            style={{
              textAlign: 'left',
              padding: '12px 13px 13px',
              borderRadius: 16,
              border: `1px solid ${isSelected ? 'var(--gold-accent)' : 'var(--border-soft)'}`,
              background: isSelected
                ? 'color-mix(in srgb, var(--gold-accent) 8%, transparent)'
                : 'var(--card-bg-soft)',
              cursor: 'pointer',
              minHeight: 128,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: isSelected ? '0 0 0 1px rgba(200,169,110,0.08)' : 'none',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isAvailable
                  ? 'rgba(200,169,110,0.08)'
                  : 'rgba(255,255,255,0.02)',
                color: isAvailable ? 'var(--gold-accent)' : 'var(--text-subtle)',
              }}>
                {isAvailable ? <BookOpen size={14} /> : <Lock size={13} />}
              </div>
              {isAvailable ? (
                <Sparkles size={11} color="var(--text-subtle)" />
              ) : (
                <span style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '7px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--text-subtle)',
                }}>
                  Coming soon
                </span>
              )}
            </div>

            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.05rem',
                color: 'var(--text-primary)',
                lineHeight: 1.16,
                marginBottom: 4,
              }}>
                {card.title}
              </div>
              <div style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
              }}>
                {card.summary}
              </div>
            </div>

            <div style={{
              marginTop: 'auto',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '7px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isAvailable ? 'var(--gold-accent)' : 'var(--text-subtle)',
            }}>
              {isAvailable ? 'Open section' : 'Planned future section'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
