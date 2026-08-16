
export default function MadXLogo({ className }) {  
  return (
    <svg
      viewBox="0 0 1064 709"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="MADX Sports logo"
    >
      {/* Red X */}
      <path
        d="M107 84H315L449 231L806 62L565 292L821 654H624L481 495L325 654H108L375 372Z"
        fill="var(--logo-accent)"
      />

      {/* MAD text */}
      <text
        x="135"
        y="460"
        fontSize="285"
        fontWeight="900"
        fontFamily="Arial Black, Arial, sans-serif"
        letterSpacing="-25"
        fill="var(--logo-text)"
        stroke="var(--logo-outline)"
        strokeWidth="5"
        paintOrder="stroke"
      >
        MAD
      </text>

      {/* Registered symbol */}
      <circle
        cx="912"
        cy="69"
        r="39"
        fill="none"
        stroke="var(--logo-accent)"
        strokeWidth="5"
      />

      <text
        x="887"
        y="88"
        fontSize="53"
        fontFamily="Arial, sans-serif"
        fill="var(--logo-accent)"
      >
        R
      </text>
    </svg>
  );
}
