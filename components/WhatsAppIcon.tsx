/** Chat bubble with a handset: the "share on WhatsApp" glyph used on share buttons. */
export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.6 19.4l1.1-3.5a8.2 8.2 0 1 1 3.3 3.1z" />
      <path d="M9.1 8.4c.2 2.4 2.6 4.8 5 5.1l1.1-1.2 1.9.9-.5 1.7c-3.4.3-7.5-3.6-7.8-7.1l1.6-.6.8 1.9z" fill="currentColor" stroke="none" />
    </svg>
  );
}
