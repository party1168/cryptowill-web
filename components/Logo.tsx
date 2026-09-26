/** The CryptoWill four-point star, same geometry as app/icon.svg and public/brand. */
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="74 74 364 364" className={className} aria-hidden>
      <defs>
        <linearGradient id="cw-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D2B27A" />
          <stop offset="0.55" stopColor="#B08D57" />
          <stop offset="1" stopColor="#8A6B3D" />
        </linearGradient>
      </defs>
      <path fill="url(#cw-brass)" d="M256.0 238.0 L318.0 164.0 L256.0 78.0 L194.0 164.0 Z M274.0 256.0 L348.0 318.0 L434.0 256.0 L348.0 194.0 Z M256.0 274.0 L194.0 348.0 L256.0 434.0 L318.0 348.0 Z M238.0 256.0 L164.0 194.0 L78.0 256.0 L164.0 318.0 Z" />
    </svg>
  );
}
