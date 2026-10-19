import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { errMsg, fmtDateTime } from '../api.js';
import Alert from '../components/Alert.jsx';
import { AvailabilityBadge, StatusBadge } from '../components/Badges.jsx';
import useFlash from '../components/useFlash.js';

export default function PurchaseDetailsPage() {
  const { ref } = useParams();
  const { state } = useLocation();
  const [purchase, setPurchase] = useState(null);
  const [msg, flash] = useFlash();

  useEffect(() => {
    if (state?.message) flash(state.message);
  }, [state, flash]);

  useEffect(() => {
    api.get(`/purchases/${encodeURIComponent(ref)}`)
      .then((res) => setPurchase(res.data))
      .catch((e) => flash(errMsg(e), 'error'));
  }, [ref, flash]);

  return (
    <section>
      <Alert msg={msg} />
      {purchase && (
        <div className="card">
          <div className="detail-row"><span>Order ID</span><strong>{purchase.orderId}</strong></div>
          <div className="detail-row"><span>Purchase Date</span><span>{purchase.purchaseDate}</span></div>
          <div className="detail-row"><span>Created</span><span>{fmtDateTime(purchase.createdAt)}</span></div>
          <div className="detail-row"><span>Last updated</span><span>{fmtDateTime(purchase.updatedAt)}</span></div>

          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Item</th><th>Item Type</th><th>Quantity</th><th>Current Stock</th>
                  <th>Availability</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((i) => (
                  <tr key={i.itemId}>
                    <td>{i.itemName}</td>
                    <td>{i.typeName}</td>
                    <td>{i.quantity}</td>
                    <td>{i.currentStock}</td>
                    <td><AvailabilityBadge value={i.availability} /></td>
                    <td><StatusBadge active={i.active} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="detail-row"><span>Total quantity</span><strong>{purchase.totalQuantity}</strong></div>
        </div>
      )}
      <div className="actions-row">
        <Link className="btn" to="/purchases">Back to list</Link>
        {purchase && <Link className="btn primary" to={`/purchases/${purchase.orderId}/edit`}>Edit Purchase</Link>}
      </div>
    </section>
  );
}
