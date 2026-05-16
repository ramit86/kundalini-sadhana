import { CHAKRA_MAP, Practice } from '../data/sessions';

interface Props {
  practices: Practice[];
  currentIndex: number;
}

export default function ChakraDots({ practices, currentIndex }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, padding: '0.5rem 1rem',
    }}>
      {practices.map((p, i) => {
        const cc = CHAKRA_MAP[p.chakra] ?? CHAKRA_MAP['Preparation'];
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              width: isActive ? 11 : 7,
              height: isActive ? 11 : 7,
              borderRadius: '50%',
              background: isDone
                ? cc.dot
                : isActive
                ? cc.dot
                : 'rgba(200,169,110,0.07)',
              border: isActive
                ? `1.5px solid ${cc.dot}`
                : isDone
                ? `1px solid ${cc.dot}88`
                : '1px solid rgba(200,169,110,0.1)',
              opacity: isDone ? 0.45 : 1,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
              boxShadow: isActive ? `0 0 10px ${cc.dot}88` : 'none',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', inset: -4,
                borderRadius: '50%',
                border: `1px solid ${cc.dot}40`,
                animation: 'pulse-ring 2s ease-in-out infinite',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
