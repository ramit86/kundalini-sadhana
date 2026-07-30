import { KnowledgeReference } from '../models/knowledge';

interface Props {
  references?: KnowledgeReference[];
  onSelect: (reference: KnowledgeReference) => void;
}

export default function KnowledgeReferenceChips({ references = [], onSelect }: Props) {
  if (!references.length) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      {references.map(reference => (
        <button
          key={`${reference.kind}-${reference.id}`}
          onClick={() => onSelect(reference)}
          style={{
            border: '1px solid var(--border-soft)',
            background: 'var(--button-ghost-bg)',
            color: 'var(--text-subtle)',
            borderRadius: 999,
            padding: '7px 11px',
            fontFamily: "'Raleway', sans-serif",
            fontSize: '7.5px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {reference.label}
          {reference.note ? (
            <span style={{ marginLeft: 6, opacity: 0.72 }}>{reference.note}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
