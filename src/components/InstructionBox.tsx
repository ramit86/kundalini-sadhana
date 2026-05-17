interface Props {
  instruction: string;
  note?: string;
  chakraColor?: string;
}

export default function InstructionBox({ instruction, note, chakraColor = 'rgba(200,169,110,0.3)' }: Props) {
  return (
    <div
      style={{
        flex: 1, minHeight: 0,
        overflowY: 'auto',
        padding: '0.5rem 0.15rem 0.5rem',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
      }}
    >
      <p
        style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: '12px',
          color: 'var(--instruction-text)',
          lineHeight: 1.82,
          fontWeight: 400,
          letterSpacing: '0.01em',
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: instruction }}
      />
      {note && (
        <div style={{
          marginTop: '0.9rem',
          fontSize: '10.5px',
          fontStyle: 'italic',
          color: 'var(--instruction-note-text)',
          borderLeft: `2px solid ${chakraColor}`,
          paddingLeft: '0.85rem',
          lineHeight: 1.75,
          fontFamily: "'Raleway', sans-serif",
          fontWeight: 400,
        }}>
          {note}
        </div>
      )}
    </div>
  );
}
