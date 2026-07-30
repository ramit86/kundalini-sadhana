import { useMemo, useState } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import KnowledgeCardGrid from '../components/KnowledgeCardGrid';
import KnowledgeArticlePanel from '../components/KnowledgeArticlePanel';
import { useKnowledgeLibrary } from '../hooks/useKnowledgeLibrary';
import { GuideCard, KnowledgeReference } from '../models/knowledge';

interface Props {
  onBack: () => void;
}

export default function KnowledgeScreen({ onBack }: Props) {
  const {
    cards,
    articlesById,
    defaultArticle,
    glossary,
  } = useKnowledgeLibrary();
  const [selectedCardId, setSelectedCardId] = useState(defaultArticle?.id ?? cards[0]?.id ?? '');
  const [selectedGlossaryId, setSelectedGlossaryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const selectedArticle = articlesById[selectedCardId] ?? defaultArticle ?? null;

  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cards;
    return cards.filter(card => (
      card.title.toLowerCase().includes(normalized) ||
      card.summary.toLowerCase().includes(normalized)
    ));
  }, [cards, query]);

  const handleSelectCard = (card: GuideCard) => {
    setSelectedCardId(card.id);
    setSelectedGlossaryId(null);
  };

  const handleNavigate = (reference: KnowledgeReference) => {
    if (reference.kind === 'article' || reference.kind === 'category') {
      if (articlesById[reference.id]) {
        setSelectedCardId(reference.id);
        setSelectedGlossaryId(null);
      }
      return;
    }

    if (reference.kind === 'glossary') {
      setSelectedCardId('sanskrit-glossary');
      setSelectedGlossaryId(reference.id);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--home-bg-gradient)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 10%, rgba(200,169,110,0.07), transparent 42%)',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '1rem 1.2rem 0.8rem',
        borderBottom: '1px solid var(--border-soft)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: '1px solid var(--border-soft)',
            background: 'var(--card-bg-soft)',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Back to Home"
        >
          <ArrowLeft size={15} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-accent)',
            marginBottom: 4,
          }}>
            Knowledge
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.45rem',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}>
            Study before, during, and after practice
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 11px',
          borderRadius: 999,
          border: '1px solid var(--border-soft)',
          background: 'var(--card-bg-soft)',
          color: 'var(--text-subtle)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '7px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          <BookOpen size={11} />
          Read only
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '1rem 1rem 1.4rem',
      }}>
        <div style={{
          maxWidth: 1160,
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
            padding: '1rem',
            borderRadius: 18,
            border: '1px solid var(--border-soft)',
            background: 'var(--card-bg-soft)',
          }}>
            <div>
              <div style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
                marginBottom: 6,
              }}>
                A calm reference library
              </div>
              <div style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                lineHeight: 1.8,
                color: 'var(--text-muted)',
                maxWidth: 820,
              }}>
                Explore preparation, safety, chakra symbolism, mudras, asanas, Sanskrit vocabulary, and sattvic eating notes. Future areas are marked as placeholders so the module can grow without redesign.
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 11px',
              borderRadius: 999,
              border: '1px solid var(--border-soft)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <Search size={11} color="var(--text-subtle)" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search topics"
                aria-label="Search knowledge topics"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  width: 120,
                }}
              />
            </div>
          </div>

          <KnowledgeCardGrid
            cards={visibleCards}
            selectedId={selectedCardId}
            onSelect={handleSelectCard}
          />

          {selectedArticle && (
            <KnowledgeArticlePanel
              article={selectedArticle}
              selectedGlossaryId={selectedGlossaryId}
              glossaryEntries={glossary}
              onNavigate={handleNavigate}
            />
          )}

          {!selectedArticle && (
            <div style={{
              padding: '1rem',
              borderRadius: 18,
              border: '1px solid var(--border-soft)',
              background: 'var(--card-bg-soft)',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '8px',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
            }}>
              No topic selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
