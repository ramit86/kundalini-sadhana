interface Props {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  indicator?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function AudioPill({ active, icon, label, indicator, disabled, onClick }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={disabled ? 'Narration coming soon' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 16,
        border: active ? '1px solid rgba(200,169,110,0.32)' : '1px solid rgba(200,169,110,0.09)',
        background: active ? 'var(--button-ghost-bg)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: active ? 'var(--gold-accent)' : 'var(--button-ghost-fg)',
        fontFamily: "'Raleway', sans-serif",
        fontSize: '9.5px', letterSpacing: '0.1em',
        transition: 'all 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {label}
      {indicator && (
        <span style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--gold-accent)', display: 'inline-block',
          animation: 'pulse-dot 1s ease-in-out infinite', marginLeft: 1,
        }} />
      )}
    </button>
  );
}
