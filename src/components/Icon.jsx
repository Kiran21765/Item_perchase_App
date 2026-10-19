// Tiny inline SVG icon set (no extra library needed).
const paths = {
  dashboard: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  inventory: 'M12 3 3 7.5v9L12 21l9-4.5v-9zM3 7.5 12 12m0 0 9-4.5M12 12v9',
  types: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6M9 20a1 1 0 1 0 0-.01M17 20a1 1 0 1 0 0-.01',
  orders: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  stock: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  power: 'M12 3v8M6.5 6.5a8 8 0 1 0 11 0',
  trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13',
  plus: 'M12 5v14M5 12h14',
  filter: 'M3 5h18l-7 8v6l-4-2v-4z',
  menu: 'M4 7h16M4 12h16M4 17h16',
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
