// Inline SVG icon set matching the Figma design — stroke icons in the lucide style,
// plus the filled sparkle used by the brand and the extracting state.

function Stroke({ children, ...props }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
}

export function LogoMark({ size = 34 }) {
  return <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="#1d1d1b" />
    <path d="M11 12l6.5 17h5L29 12h-4.6l-4.4 12.2L15.6 12z" fill="#fff" />
  </svg>
}

export function Sparkle({ size = 22, ...props }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 0c.9 6.8 4.3 10.2 12 12-7.7 1.8-11.1 5.2-12 12-.9-6.8-4.3-10.2-12-12C7.7 10.2 11.1 6.8 12 0Z" />
  </svg>
}

export const HomeIcon = (props) => <Stroke {...props}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></Stroke>
export const ClassroomIcon = (props) => <Stroke {...props}><path d="M3.5 20V8.5L12 4l8.5 4.5V20" /><path d="M9 20v-6h6v6" /></Stroke>
export const AssignmentsIcon = (props) => <Stroke {...props}><path d="M7 3.5h7.5L19 8v12.5H7z" /><path d="M14 3.5V8h5M10 12.5h5.5M10 16h5.5" /></Stroke>
export const ExamsIcon = (props) => <Stroke {...props}><rect x="4" y="6.5" width="16" height="13" rx="2.5" /><path d="M8.5 6.5V5A1.8 1.8 0 0 1 10.3 3.2h3.4A1.8 1.8 0 0 1 15.5 5v1.5M4 11.5h16" /></Stroke>
export const LibraryIcon = (props) => <Stroke {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Stroke>
export const SettingsIcon = (props) => <Stroke {...props}><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.7-1.6L13.4 2h-2.8l-.4 2.9a7 7 0 0 0-2.7 1.6l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .55.07 1.08.2 1.6l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.7 1.6l.4 2.9h2.8l.4-2.9a7 7 0 0 0 2.7-1.6l2.3 1 2-3.4-2-1.5c.13-.52.2-1.05.2-1.6Z" /></Stroke>
export const HelpIcon = (props) => <Stroke {...props}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.3a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2.1-2.5 3.6" /><circle cx="12" cy="17" r=".4" fill="currentColor" /></Stroke>
export const BellIcon = (props) => <Stroke {...props}><path d="M18 9.5a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17s-2.5-1-2.5-7" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></Stroke>
export const BackIcon = (props) => <Stroke {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></Stroke>
export const FolderIcon = (props) => <Stroke {...props}><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2.5h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></Stroke>
export const ChevronDown = (props) => <Stroke {...props}><path d="M6 9.5l6 6 6-6" /></Stroke>
export const ChevronRight = (props) => <Stroke {...props}><path d="M9.5 6l6 6-6 6" /></Stroke>
export const UploadIcon = (props) => <Stroke {...props}><path d="M6.5 15a4.5 4.5 0 1 1 .9-8.9 6 6 0 0 1 11.6 1.6A4 4 0 0 1 18 15" /><path d="M12 11.5V20M8.5 15l3.5-3.5L15.5 15" /></Stroke>
export const CloseIcon = (props) => <Stroke {...props}><path d="M6 6l12 12M18 6L6 18" /></Stroke>
export const MinusIcon = (props) => <Stroke {...props}><path d="M5.5 12h13" /></Stroke>
export const PlusIcon = (props) => <Stroke {...props}><path d="M12 5.5v13M5.5 12h13" /></Stroke>
export const ArrowRight = (props) => <Stroke {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Stroke>
export const DownloadIcon = (props) => <Stroke {...props}><path d="M12 4v11M7.5 11l4.5 4.5L16.5 11" /><path d="M4.5 19.5h15" /></Stroke>

export function PdfBadge({ size = 30 }) {
  return <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#e8492f" />
    <text x="16" y="20.5" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="8.2" fontWeight="700" fill="#fff">PDF</text>
  </svg>
}

// Teacher illustration for the upload screen: soft orbit rings + dots around a
// simply-drawn figure holding a book, echoing the Figma artwork without an asset.
export function TeacherIllustration({ size = 150 }) {
  return <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
    <circle cx="80" cy="80" r="62" fill="#fde7d8" opacity=".55" />
    <circle cx="80" cy="80" r="46" fill="#fbd6bc" opacity=".6" />
    <circle cx="80" cy="80" r="33" fill="#fff" />
    <g transform="translate(58 44)">
      <circle cx="22" cy="16" r="13" fill="#f7b98d" />
      <path d="M8 15c0-9 6-15 14-15s14 6 14 15c-3-4-8-6-14-6s-11 2-14 6Z" fill="#3d2c23" />
      <rect x="14" y="26" width="16" height="5" rx="2.5" fill="#fff" />
      <path d="M2 66c0-16 9-28 20-28s20 12 20 28Z" fill="#f1600d" />
      <rect x="-4" y="42" width="30" height="21" rx="3" fill="#fff" stroke="#e2e0da" />
      <path d="M-1 47h24M-1 51h24M-1 55h16" stroke="#f3a488" strokeWidth="2" strokeLinecap="round" />
    </g>
    <g fill="#f1600d">
      <circle cx="80" cy="12" r="4.5" />
      <circle cx="140" cy="64" r="4" />
      <circle cx="118" cy="136" r="4" />
      <circle cx="30" cy="118" r="3.6" />
      <circle cx="16" cy="52" r="3.2" />
    </g>
    <g fill="none" stroke="#f1600d" strokeWidth="1.6" opacity=".65">
      <circle cx="80" cy="80" r="68" strokeDasharray="3 9" />
    </g>
  </svg>
}
