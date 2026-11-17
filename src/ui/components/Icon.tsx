const paths = {
  back: 'M15 5l-7 7 7 7',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  chat: 'M4 5h16v11H9l-5 4z',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.5a3.2 3.2 0 0 1 0 6.3M18 14.8c2 .7 3.2 2.5 3.5 5.2',
  clip: 'M9 4h6v3H9zM7 5.5H5.5V21h13V5.5H17M8.5 11h7M8.5 14.5h7M8.5 18h4',
  gavel: 'M13.5 4.5l6 6M11 7l6 6M12.2 5.8l-4.4 4.4 6 6 4.4-4.4M10.9 13.1L4 20',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  clip2: 'M20 11.5l-8.2 8.2a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4',
  forward: 'M5 6l7 6-7 6M12 6l7 6-7 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  warning: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  chevron: 'M9 5l7 7-7 7',
  restart: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4',
  note: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
  quote: 'M5 17c0-4 1.5-7 5-9M14 17c0-4 1.5-7 5-9M5 17h4v-4H5zM14 17h4v-4h-4z',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  photo: 'M3 6h18v13H3zM8 6l1.5-2h5L16 6M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  log: 'M4 5h16M4 10h16M4 15h16M4 20h10',
} satisfies Record<string, string>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 22, title }: { name: IconName; size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={paths[name]} />
    </svg>
  );
}
