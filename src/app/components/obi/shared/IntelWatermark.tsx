/** Game Plan–style corner watermark — massive, bleeding off-screen */
export function IntelWatermark() {
  return (
    <div
      className="fixed pointer-events-none select-none"
      aria-hidden
      style={{
        zIndex: 0,
        bottom: '-0.15em',
        right: '-0.12em',
        fontSize: '320px',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: '#FFFFFF',
        opacity: 0.07,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      INTEL
    </div>
  );
}
