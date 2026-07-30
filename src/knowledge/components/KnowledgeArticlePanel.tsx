import { ChevronRight, Sparkles } from 'lucide-react';
import {
  GlossaryEntry,
  KnowledgeArticle,
  KnowledgeEntry,
  KnowledgeReference,
  KnowledgeSection,
} from '../models/knowledge';
import KnowledgeReferenceChips from './KnowledgeReferenceChips';

interface Props {
  article: KnowledgeArticle;
  selectedGlossaryId?: string | null;
  glossaryEntries?: GlossaryEntry[];
  onNavigate: (reference: KnowledgeReference) => void;
}

export default function KnowledgeArticlePanel({
  article,
  selectedGlossaryId,
  glossaryEntries = [],
  onNavigate,
}: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{
        padding: '1.05rem 1rem',
        borderRadius: 18,
        border: '1px solid var(--border-soft)',
        background: 'var(--card-bg-soft)',
      }}>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold-accent)',
          marginBottom: 6,
        }}>
          Knowledge Article
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.45rem',
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          marginBottom: 8,
        }}>
          {article.title}
        </div>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '9px',
          lineHeight: 1.8,
          color: 'var(--text-muted)',
          maxWidth: 760,
        }}>
          {article.summary}
        </div>
        {article.status === 'coming-soon' && (
          <div style={{
            marginTop: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 999,
            border: '1px solid var(--border-soft)',
            background: 'rgba(255,255,255,0.02)',
            color: 'var(--text-subtle)',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '7.5px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            <Sparkles size={10} />
            Planned future section
          </div>
        )}
      </div>

      {article.id === 'sanskrit-glossary' ? (
        <GlossaryPanel
          entries={glossaryEntries}
          selectedGlossaryId={selectedGlossaryId}
          onNavigate={onNavigate}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {article.sections.map(section => (
            <KnowledgeSectionPanel
              key={section.id}
              section={section}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {article.references?.length ? (
        <div style={{
          padding: '1rem',
          borderRadius: 18,
          border: '1px solid var(--border-soft)',
          background: 'color-mix(in srgb, var(--card-bg) 70%, transparent)',
          display: 'grid',
          gap: 10,
        }}>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-subtle)',
          }}>
            Related references
          </div>
          <KnowledgeReferenceChips references={article.references} onSelect={onNavigate} />
        </div>
      ) : null}
    </div>
  );
}

function GlossaryPanel({
  entries,
  selectedGlossaryId,
  onNavigate,
}: {
  entries: GlossaryEntry[];
  selectedGlossaryId?: string | null;
  onNavigate: (reference: KnowledgeReference) => void;
}) {
  const selected = selectedGlossaryId
    ? entries.find(entry => entry.id === selectedGlossaryId) ?? null
    : null;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {selected && (
        <div style={{
          padding: '1rem',
          borderRadius: 18,
          border: '1px solid var(--gold-accent)',
          background: 'color-mix(in srgb, var(--gold-accent) 8%, transparent)',
        }}>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold-accent)',
            marginBottom: 6,
          }}>
            Focused term
          </div>
          <GlossaryEntryCard entry={selected} onNavigate={onNavigate} />
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {entries.map(entry => (
          <GlossaryEntryCard
            key={entry.id}
            entry={entry}
            onNavigate={onNavigate}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function GlossaryEntryCard({
  entry,
  onNavigate,
  compact = false,
}: {
  entry: GlossaryEntry;
  onNavigate: (reference: KnowledgeReference) => void;
  compact?: boolean;
}) {
  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid var(--border-soft)',
      background: 'var(--card-bg-soft)',
      padding: compact ? '0.9rem' : '1rem',
      display: 'grid',
      gap: 8,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.08rem',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
          }}>
            {entry.word}
          </div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '7.5px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-subtle)',
            marginTop: 4,
          }}>
            {entry.pronunciation}
          </div>
        </div>
        <ChevronRight size={12} color="var(--text-subtle)" />
      </div>

      <div style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '8px',
        letterSpacing: '0.06em',
        color: 'var(--text-muted)',
        lineHeight: 1.7,
      }}>
        {entry.meaning}
      </div>

      <div style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: '8px',
        color: 'var(--text-subtle)',
        lineHeight: 1.7,
      }}>
        {entry.explanation}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
      }}>
        {entry.relatedTerms.map(term => (
          <span
            key={term}
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: '1px solid var(--border-soft)',
              background: 'rgba(255,255,255,0.02)',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '7px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-subtle)',
            }}
          >
            {term}
          </span>
        ))}
      </div>

      <KnowledgeReferenceChips references={entry.crossLinks} onSelect={onNavigate} />
    </div>
  );
}

function KnowledgeSectionPanel({
  section,
  onNavigate,
}: {
  section: KnowledgeSection;
  onNavigate: (reference: KnowledgeReference) => void;
}) {
  return (
    <div style={{
      padding: '1rem',
      borderRadius: 18,
      border: '1px solid var(--border-soft)',
      background: 'var(--card-bg-soft)',
      display: 'grid',
      gap: 10,
    }}>
      <div>
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold-accent)',
          marginBottom: 5,
        }}>
          {section.title}
        </div>
        {section.summary ? (
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '8px',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
          }}>
            {section.summary}
          </div>
        ) : null}
      </div>

      {section.paragraphs?.length ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {section.paragraphs.map((paragraph, idx) => (
            <p
              key={`${section.id}-paragraph-${idx}`}
              style={{
                margin: 0,
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                lineHeight: 1.85,
                color: 'var(--text-muted)',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {section.bullets?.length ? (
        <ul style={{
          margin: 0,
          paddingLeft: 18,
          display: 'grid',
          gap: 6,
          color: 'var(--text-muted)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          lineHeight: 1.75,
        }}>
          {section.bullets.map((bullet, idx) => (
            <li key={`${section.id}-bullet-${idx}`}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {section.entries?.length ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 10,
        }}>
          {section.entries.map(entry => (
            <KnowledgeEntryCard
              key={entry.id}
              entry={entry}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}

      {section.note ? (
        <div style={{
          padding: '0.8rem 0.9rem',
          borderRadius: 14,
          border: '1px solid var(--border-soft)',
          background: 'rgba(255,255,255,0.02)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          color: 'var(--text-subtle)',
          lineHeight: 1.7,
        }}>
          {section.note}
        </div>
      ) : null}

      {section.references?.length ? (
        <KnowledgeReferenceChips references={section.references} onSelect={onNavigate} />
      ) : null}
    </div>
  );
}

function KnowledgeEntryCard({
  entry,
  onNavigate,
}: {
  entry: KnowledgeEntry;
  onNavigate: (reference: KnowledgeReference) => void;
}) {
  return (
    <div style={{
      padding: '0.95rem',
      borderRadius: 16,
      border: '1px solid var(--border-soft)',
      background: 'color-mix(in srgb, var(--card-bg) 72%, transparent)',
      display: 'grid',
      gap: 8,
    }}>
      <div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.08rem',
          color: 'var(--text-primary)',
          lineHeight: 1.18,
        }}>
          {entry.title}
        </div>
        {entry.subtitle ? (
          <div style={{
            marginTop: 4,
            fontFamily: "'Raleway', sans-serif",
            fontSize: '7.5px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-subtle)',
            lineHeight: 1.6,
          }}>
            {entry.subtitle}
          </div>
        ) : null}
      </div>

      {entry.summary ? (
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
        }}>
          {entry.summary}
        </div>
      ) : null}

      {entry.facts?.length ? (
        <div style={{
          display: 'grid',
          gap: 6,
          paddingTop: 2,
        }}>
          {entry.facts.map(fact => (
            <div key={`${entry.id}-${fact.label}`} style={{
              display: 'grid',
              gap: 2,
            }}>
              <div style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '7px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
              }}>
                {fact.label}
              </div>
              <div style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                lineHeight: 1.65,
                color: 'var(--text-muted)',
              }}>
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {entry.paragraphs?.length ? (
        <div style={{ display: 'grid', gap: 6 }}>
          {entry.paragraphs.map((paragraph, idx) => (
            <p
              key={`${entry.id}-paragraph-${idx}`}
              style={{
                margin: 0,
                fontFamily: "'Raleway', sans-serif",
                fontSize: '8px',
                lineHeight: 1.7,
                color: 'var(--text-muted)',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {entry.bullets?.length ? (
        <ul style={{
          margin: 0,
          paddingLeft: 18,
          display: 'grid',
          gap: 4,
          color: 'var(--text-muted)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          lineHeight: 1.65,
        }}>
          {entry.bullets.map((bullet, idx) => (
            <li key={`${entry.id}-bullet-${idx}`}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {entry.caution ? (
        <div style={{
          padding: '0.7rem 0.8rem',
          borderRadius: 12,
          background: 'rgba(200,169,110,0.06)',
          border: '1px solid rgba(200,169,110,0.12)',
          fontFamily: "'Raleway', sans-serif",
          fontSize: '8px',
          lineHeight: 1.7,
          color: 'var(--text-subtle)',
        }}>
          {entry.caution}
        </div>
      ) : null}

      {entry.illustrationPlaceholder ? (
        <div style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '7px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
          lineHeight: 1.6,
        }}>
          {entry.illustrationPlaceholder}
        </div>
      ) : null}

      {entry.references?.length ? (
        <KnowledgeReferenceChips references={entry.references} onSelect={onNavigate} />
      ) : null}
    </div>
  );
}
