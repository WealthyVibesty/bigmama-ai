interface AgentIconProps {
  type: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AgentIcon({ type, size = "md", className = "" }: AgentIconProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-16 w-16 text-2xl",
  }[size];

  switch (type) {
    case "delegator":
      return (
        <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
        </div>
      );
    case "resend":
      return (
        <div className={`${sizeClasses} rounded-xl bg-neutral-600 flex items-center justify-center text-white shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        </div>
      );
    case "brandapp":
      return (
        <div className={`${sizeClasses} rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      );
    case "hyperframes":
      return (
        <div className={`${sizeClasses} rounded-xl bg-neutral-500 flex items-center justify-center text-white shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          </svg>
        </div>
      );
    case "dealmaker":
      return (
        <div className={`${sizeClasses} rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.93 4.93 14.14 14.14" />
          </svg>
        </div>
      );
    case "margins":
      return (
        <div className={`${sizeClasses} rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "notebook":
      return (
        <div className={`${sizeClasses} rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </div>
      );
    case "life":
      return (
        <div className={`${sizeClasses} rounded-xl bg-amber-700 flex items-center justify-center text-white shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      );
    case "security":
      return (
        <div className={`${sizeClasses} rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      );
    case "designer":
    default:
      return (
        <div className={`${sizeClasses} rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0 ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-1/2 h-1/2">
            <circle cx="12" cy="12" r="10" />
            <path d="m10 15 5-3-5-3v6Z" />
          </svg>
        </div>
      );
  }
}
