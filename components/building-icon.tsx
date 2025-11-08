interface BuildingIconProps {
  type: string
}

export default function BuildingIcon({ type }: BuildingIconProps) {
  const iconMap: Record<string, string> = {
    "building-columns": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="1"/>
        <line x1="6" y1="5" x2="6" y2="19"/>
        <line x1="10" y1="5" x2="10" y2="19"/>
        <line x1="14" y1="5" x2="14" y2="19"/>
        <line x1="18" y1="5" x2="18" y2="19"/>
        <rect x="3" y="12" width="18" height="1"/>
        <path d="M8 2v2M16 2v2"/>
      </svg>
    `,
    "building-tower": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 3h8v18H8z"/>
        <line x1="8" y1="7" x2="16" y2="7"/>
        <line x1="8" y1="11" x2="16" y2="11"/>
        <line x1="8" y1="15" x2="16" y2="15"/>
        <path d="M11 2v3M13 2v3"/>
      </svg>
    `,
    "building-government": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6l8-3 8 3v2h-16z"/>
        <rect x="4" y="8" width="16" height="12" rx="1"/>
        <line x1="8" y1="8" x2="8" y2="20"/>
        <line x1="12" y1="8" x2="12" y2="20"/>
        <line x1="16" y1="8" x2="16" y2="20"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
      </svg>
    `,
    "building-arch": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 20h2V10a4 4 0 0 1 8 0v10h2M6 20h12"/>
        <line x1="10" y1="15" x2="14" y2="15"/>
        <path d="M12 3v4"/>
      </svg>
    `,
    "building-classic": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="15" rx="1"/>
        <rect x="6" y="8" width="2" height="2"/>
        <rect x="11" y="8" width="2" height="2"/>
        <rect x="16" y="8" width="2" height="2"/>
        <rect x="6" y="13" width="2" height="2"/>
        <rect x="11" y="13" width="2" height="2"/>
        <rect x="16" y="13" width="2" height="2"/>
        <path d="M12 3v2"/>
      </svg>
    `,
    "building-temple": `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 7l6-4 6 4"/>
        <rect x="4" y="7" width="16" height="13" rx="1"/>
        <line x1="9" y1="7" x2="9" y2="20"/>
        <line x1="15" y1="7" x2="15" y2="20"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
      </svg>
    `,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: iconMap[type] || iconMap["building-columns"] }}
    />
  )
}
