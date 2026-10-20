// Simple stroke icons (decorative). Swap for Fluent UI System Icons in production
// to match the Power BI environment, as the design system recommends.
const PATHS = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13',
  table: 'M3 5h18v14H3zM3 10h18M9 10v9',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 16.5v.5',
  close: 'M6 6l12 12M18 6L6 18',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, color = 'currentColor', style }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none', ...style }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
