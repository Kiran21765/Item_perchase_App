import { useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// round the top of the scale up to a multiple of 4 so the 4 gridlines are whole numbers
const niceMax = (v) => Math.max(4, Math.ceil(v / 4) * 4);

/** Units purchased per month. One series, one colour; the active month is highlighted. */
export function BarChart({ values, year }) {
  const now = new Date();
  const defaultActive = now.getFullYear() === year ? now.getMonth() : null;
  const [hover, setHover] = useState(null);
  const active = hover ?? defaultActive;

  const W = 640, H = 260, L = 34, R = 8, T = 40, B = 28;
  const max = niceMax(Math.max(...values, 1));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const step = (W - L - R) / 12;
  const bw = Math.min(30, step - 10);
  const y = (v) => T + (H - T - B) * (1 - v / max);

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Units purchased per month in ${year}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = L + step * i + (step - bw) / 2;
          const h = Math.max(0, H - B - y(v));
          const r = Math.min(4, h / 2);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={L + step * i} y={T} width={step} height={H - T - B} fill="transparent" />
              {v > 0 && (
                <path className={i === active ? 'bar active' : 'bar'}
                      d={`M${x},${H - B} V${y(v) + r} a${r},${r} 0 0 1 ${r},${-r} h${bw - 2 * r} a${r},${r} 0 0 1 ${r},${r} V${H - B} z`} />
              )}
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" className={i === active ? 'axis strong' : 'axis'}>
                {MONTHS[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <div className="tooltip" style={{ left: `${((L + step * active + step / 2) / W) * 100}%` }}>
          <span className="dot" /> {MONTHS[active]} {year}: <strong>{values[active]}</strong> units
        </div>
      )}
      <table className="sr-only">
        <caption>Units purchased per month</caption>
        <tbody>{values.map((v, i) => <tr key={i}><th>{MONTHS[i]}</th><td>{v}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** Stock status donut: in stock / low stock / out of stock. */
export function Donut({ inStock, lowStock, outOfStock }) {
  const parts = [
    { key: 'in', label: 'In Stock', value: inStock, cls: 'seg-in' },
    { key: 'low', label: 'Low Stock', value: lowStock, cls: 'seg-low' },
    { key: 'out', label: 'Out of Stock', value: outOfStock, cls: 'seg-out' },
  ];
  const total = inStock + lowStock + outOfStock;
  const [hover, setHover] = useState(null);
  const R = 70, C = 2 * Math.PI * R, gap = total > 0 && parts.filter((p) => p.value).length > 1 ? 4 : 0;
  let offset = 0;
  const shown = hover ? parts.find((p) => p.key === hover) : null;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" role="img"
           aria-label={`Stock status: ${inStock} in stock, ${lowStock} low, ${outOfStock} out of stock`}>
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#eceef6" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#9aa0b8" strokeWidth="2" />
          </pattern>
        </defs>
        <circle cx="100" cy="100" r={R} className="ring-bg" />
        {total > 0 && parts.map((p) => {
          if (!p.value) return null;
          const len = (p.value / total) * C;
          const el = (
            <circle key={p.key} cx="100" cy="100" r={R} fill="none" strokeWidth="26"
                    className={`${p.cls} ${hover && hover !== p.key ? 'dim' : ''}`}
                    strokeDasharray={`${Math.max(len - gap, 0.5)} ${C}`} strokeDashoffset={-offset}
                    transform="rotate(-90 100 100)"
                    onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)} />
          );
          offset += len;
          return el;
        })}
        <text x="100" y="98" textAnchor="middle" className="donut-num">{shown ? shown.value : total}</text>
        <text x="100" y="118" textAnchor="middle" className="donut-sub">{shown ? shown.label : 'Total items'}</text>
      </svg>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className={`swatch ${p.cls}`} />
            <span className="lg-label">{p.label}</span>
            <strong>{p.value}</strong>
            <small>{total ? Math.round((p.value / total) * 100) : 0}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
