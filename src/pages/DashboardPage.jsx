import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import Alert from '../components/Alert.jsx';
import { BarChart, Donut } from '../components/Charts.jsx';
import { AvailabilityBadge } from '../components/Badges.jsx';
import useFlash from '../components/useFlash.js';

export default function DashboardPage() {
  const [d, setD] = useState(null);
  const [items, setItems] = useState([]);
  const [msg, flash] = useFlash();

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/items')])
      .then(([a, b]) => { setD(a.data); setItems(b.data); })
      .catch((e) => flash(errMsg(e), 'error'));
  }, [flash]);

  const cards = d && [
    { label: 'Total Items', value: d.totalItems, tone: '' },
    { label: 'In Stock', value: d.inStock, tone: 'green' },
    { label: 'Low Stock', value: d.lowStock, tone: 'orange' },
    { label: 'Out of Stock', value: d.outOfStock, tone: 'red' },
  ];

  return (
    <>
      <Alert msg={msg} />
      <div className="stat-grid">
        {(cards || [1, 2, 3, 4].map(() => ({ label: ' ', value: '-' }))).map((c, i) => (
          <div className="card stat" key={i}>
            <div className="stat-top"><span>{c.label}</span>{c.tone && <i className={`pill ${c.tone}`} />}</div>
            <div className="stat-num">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Purchases per Month</h3>
            {d && <span className="muted">{d.totalOrders} orders · {d.totalUnitsPurchased} units in total</span>}
          </div>
          {d && <BarChart values={d.monthlyUnits} year={d.year} />}
        </div>
        <div className="card">
          <div className="card-head"><h3>Inventory Alerts</h3></div>
          {d && <Donut inStock={d.inStock} lowStock={d.lowStock} outOfStock={d.outOfStock} />}
        </div>
      </div>

      <div className="card flush">
        <div className="card-head pad">
          <h3>Product Inventory</h3>
          <Link className="btn pill-btn" to="/items">See All</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Purchase Date</th><th>Units</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="empty">No items yet.</td></tr>}
              {items.slice(0, 5).map((i) => (
                <tr key={i.id}>
                  <td><span className="thumb">{i.name[0]}</span><strong>{i.name}</strong></td>
                  <td>{i.typeName}</td>
                  <td>{i.purchaseDate}</td>
                  <td>{i.stockAvailable}</td>
                  <td><AvailabilityBadge value={i.availability} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
