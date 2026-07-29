interface Props {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ControlBtn({ onClick, title, children }: Props) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 52, height: 52, borderRadius: '50%',
        border: '1px solid rgba(200,169,110,0.11)',
        background: 'var(--button-ghost-bg)',
        cursor: 'pointer', color: 'var(--button-ghost-fg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.28)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-accent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.11)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--button-ghost-fg)';
      }}
    >
      {children}
    </button>
  );
}
