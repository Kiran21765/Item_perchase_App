import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import Alert from '../components/Alert.jsx';
import { AvailabilityBadge, StatusBadge } from '../components/Badges.jsx';
import useFlash from '../components/useFlash.js';

export default function StockPage() {
  const [items, setItems] = useState([]);
  const [msg, flash] = useFlash();

  useEffect(() => {
    api.get('/items').then((res) => setItems(res.data)).catch((e) => flash(errMsg(e), 'error'));
  }, [flash]);

  return (
    <section>
      <Alert msg={msg} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Item</th><th>Type</th><th>Current Stock</th><th>Availability</th><th>Status</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No items.</td></tr>}
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.typeName}</td>
                <td>{i.stockAvailable}</td>
                <td><AvailabilityBadge value={i.availability} /></td>
                <td><StatusBadge active={i.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
