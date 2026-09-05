// Hand-authored SVG logo — no external asset, so it scales crisply at any
// size and inherits the brand palette from CSS custom properties. The mark
// is a "Z" roundel with a small accent dot standing in for the journey from
// doorstep to doorstep; the wordmark is optional so the same component works
// as a compact icon (navbar) or a full lockup (landing page hero).
export function Logo({
  size = 40,
  withWordmark = false,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={["logo-lockup", className].filter(Boolean).join(" ")}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="var(--brand-light)" stroke="var(--brand-dark)" strokeWidth="2" />
        <path
          d="M20 22h22.5a1 1 0 0 1 .78 1.63L23.4 47.5A1 1 0 0 0 24.18 49H45"
          stroke="var(--brand-dark)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="47" cy="17" r="4.5" fill="var(--brand)" />
      </svg>
      {withWordmark && (
        <span className="logo-wordmark">
          <span className="brand-name">Zuri Express</span>
          <span className="brand-tagline">A Taste of Kenya, Beyond Kenya</span>
        </span>
      )}
    </span>
  );
}
