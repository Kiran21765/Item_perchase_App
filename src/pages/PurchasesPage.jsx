import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import Alert from '../components/Alert.jsx';
import useFlash from '../components/useFlash.js';

export default function PurchasesPage() {
  const [list, setList] = useState([]);
  const [msg, flash] = useFlash();

  useEffect(() => {
    api.get('/purchases').then((res) => setList(res.data)).catch((e) => flash(errMsg(e), 'error'));
  }, [flash]);

  return (
    <section>
      <p className="note">Purchases are historical records and cannot be deleted.</p>
      <Alert msg={msg} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Order ID</th><th>Purchase Date</th><th>Item Lines</th><th>Total Quantity</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="empty">No purchases yet.</td></tr>}
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.orderId}</td>
                <td>{p.purchaseDate}</td>
                <td>{p.itemLines}</td>
                <td>{p.totalQuantity}</td>
                <td className="actions-cell">
                  <Link className="btn small" to={`/purchases/${p.orderId}`}>View Details</Link>
                  <Link className="btn small" to={`/purchases/${p.orderId}/edit`}>Update</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
