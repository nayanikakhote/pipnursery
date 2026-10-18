import Pip from '../components/Pip';

// Temporary filler while each app is being built.
export default function Placeholder() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 12, padding: 24, textAlign: 'center', height: '100%' }}>
      <Pip width="110px" mood="yawn" />
      <p style={{ fontFamily: 'var(--font-pixel)', margin: 0 }}>pip is still painting this room… 🎨</p>
    </div>
  );
}
