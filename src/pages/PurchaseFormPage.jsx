import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, today } from '../api.js';
import Alert from '../components/Alert.jsx';
import useFlash from '../components/useFlash.js';

// One page for both "Create Purchase" (/purchases/new) and "Update Purchase" (/purchases/:ref/edit)
export default function PurchaseFormPage() {
  const { ref } = useParams();
  const editing = Boolean(ref);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);       // active items that can be selected
  const [lines, setLines] = useState([]);       // [{ itemId, itemName, typeName, quantity }]
  const [orderId, setOrderId] = useState('');
  const [date, setDate] = useState(today());
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, flash] = useFlash();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = (await api.get('/items', { params: { active: true } })).data;
        if (cancelled) return;
        setItems(list);
        setItemId('');
        setQty(1);
        if (editing) {
          const p = (await api.get(`/purchases/${encodeURIComponent(ref)}`)).data;
          if (cancelled) return;
          setOrderId(p.orderId);
          setDate(p.purchaseDate);
          setLines(p.items.map((i) => ({
            itemId: i.itemId, itemName: i.itemName, typeName: i.typeName, quantity: i.quantity,
          })));
        } else {
          const next = (await api.get('/purchases/next-order-id')).data;
          if (cancelled) return;
          setOrderId(next.orderId);
          setDate(today());
          setLines([]);
        }
      } catch (e) {
        flash(errMsg(e), 'error');
      }
    })();
    return () => { cancelled = true; };
  }, [ref, editing, flash]);

  const addLine = () => {
    const item = items.find((i) => String(i.id) === itemId);
    const quantity = Number(qty);
    if (!item) return flash('Please select an item', 'error');
    if (!Number.isInteger(quantity) || quantity <= 0) return flash('Quantity must be greater than zero', 'error');

    setLines((current) => {
      const existing = current.find((l) => l.itemId === item.id);
      if (existing) {
        // same item twice -> combine into one line
        return current.map((l) => (l.itemId === item.id ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...current, { itemId: item.id, itemName: item.name, typeName: item.typeName, quantity }];
    });
    setQty(1);
  };

  const removeLine = (id) => setLines((current) => current.filter((l) => l.itemId !== id));

  const submit = async () => {
    setSaving(true);
    const body = {
      purchaseDate: date,
      items: lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
    };
    try {
      let res;
      if (editing) {
        res = await api.put(`/purchases/${encodeURIComponent(ref)}`, body);
      } else {
        res = await api.post('/purchases', { ...body, orderId });
      }
      navigate(`/purchases/${res.data.orderId}`, {
        state: { message: `Purchase ${editing ? 'updated' : 'created'}: ${res.data.orderId}` },
      });
    } catch (err) {
      flash(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <p className="muted lead">{editing ? `Update Purchase ${orderId}` : 'Create a purchase order with one or more items'}</p>
      <Alert msg={msg} />
      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="orderId">Order ID</label>
            <input id="orderId" value={orderId} maxLength={30} readOnly={editing}
                   onChange={(e) => setOrderId(e.target.value)} />
            <small>
              {editing
                ? 'Order ID cannot be changed. Stock is adjusted by the quantity difference.'
                : 'Auto-generated. You may change it (must be unique).'}
            </small>
          </div>
          <div className="field">
            <label htmlFor="date">Purchase Date *</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <h3>Add items to this order</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="item">Item *</label>
            <select id="item" value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">-- Select item --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id} disabled={i.stockAvailable === 0}>
                  {i.name} ({i.typeName}) - stock: {i.stockAvailable}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="qty">Quantity *</label>
            <input id="qty" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="field actions">
            <button type="button" className="btn" onClick={addLine}>Add to Order</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Type</th><th>Quantity</th><th>Action</th></tr></thead>
            <tbody>
              {lines.length === 0 && <tr><td colSpan={4} className="empty">No items added yet.</td></tr>}
              {lines.map((l) => (
                <tr key={l.itemId}>
                  <td>{l.itemName}</td>
                  <td>{l.typeName}</td>
                  <td>{l.quantity}</td>
                  <td><button className="btn small danger" onClick={() => removeLine(l.itemId)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="actions-row">
          <button className="btn primary" onClick={submit} disabled={saving}>
            {editing ? 'Save Changes' : 'Submit Purchase'}
          </button>
          <button className="btn" onClick={() => navigate('/purchases')}>Cancel</button>
        </div>
      </div>
    </section>
  );
}
