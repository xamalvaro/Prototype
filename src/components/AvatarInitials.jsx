const COLORS = [
  '#7C3AED',
  '#6d28d9',
  '#8b5cf6',
  '#5b21b6',
  '#4c1d95',
  '#a78bfa',
  '#7e22ce',
  '#9333ea',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(displayName) {
  if (!displayName) return '?';
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AvatarInitials({ username, displayName, size = 36 }) {
  const name = username || displayName || '?';
  const color = COLORS[hashString(name) % COLORS.length];
  const initials = getInitials(displayName || username || '?');

  const fontSize = size * 0.38;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '0.02em',
        boxShadow: '0 0 8px rgba(124,58,237,0.5)',
        fontFamily: 'Share Tech Mono, monospace',
      }}
    >
      {initials}
    </div>
  );
}

export default AvatarInitials;
