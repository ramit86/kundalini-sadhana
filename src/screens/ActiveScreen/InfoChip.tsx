interface Props {
  label: string;
  value: string;
  color: string;
}

export default function InfoChip({ label, value, color }: Props) {
  return (
    <div style={{
      padding: '4px 8px',
      borderRadius: 8,
      border: `1px solid ${color}22`,
      background: `${color}0F`,
      minWidth: 90,
    }}>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
        {value}
      </div>
    </div>
  );
}
