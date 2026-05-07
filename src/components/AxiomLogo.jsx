export default function AxiomLogo() {
  return (
    <svg
      width="140"
      height="36"
      viewBox="0 0 140 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AXIOM"
    >
      <title>AXIOM</title>
      <defs>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--bg-1)" stopOpacity="0" />
          <stop offset="40%" stopColor="var(--bg-1)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--bg-1)" stopOpacity="0.7" />
          <stop offset="60%" stopColor="var(--bg-1)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--bg-1)" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0"
            to="2 0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <mask id="shine-mask">
          <rect width="140" height="36" fill="white" />
        </mask>
      </defs>
      <text
        x="0"
        y="28"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="900"
        fontSize="32"
        fill="var(--text-1)"
        letterSpacing="-1"
      >
        AXIOM
      </text>
      <rect width="140" height="36" fill="url(#shine)" mask="url(#shine-mask)" />
    </svg>
  )
}
