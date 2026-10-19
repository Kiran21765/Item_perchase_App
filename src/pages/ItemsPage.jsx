import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg, fmtDateTime, today } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import { AvailabilityBadge, StatusBadge } from '../components/Badges.jsx';
import Icon from '../components/Icon.jsx';
import useFlash from '../components/useFlash.js';

const emptyForm = () => ({ name: '', itemTypeId: '', purchaseDate: today(), stockAvailable: '', active: 'true' });

export default function ItemsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const [avail, setAvail] = useState('');
  const [msg, flash] = useFlash();

  const load = useCallback(async () => {
    try {
      const [i, t] = await Promise.all([api.get('/items'), api.get('/item-types')]);
      setItems(i.data);
      setTypes(t.data);
    } catch (e) {
      flash(errMsg(e), 'error');
    }
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  const shown = useMemo(
    () => items.filter((i) => (!q || i.name.toLowerCase().includes(q) || i.typeName.toLowerCase().includes(q))
      && (!avail || i.availability === avail)),
    [items, q, avail]
  );

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(emptyForm()); setEditId(null); };

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      itemTypeId: form.itemTypeId === '' ? null : Number(form.itemTypeId),
      purchaseDate: form.purchaseDate,
      stockAvailable: form.stockAvailable === '' ? null : Number(form.stockAvailable),
      active: form.active === 'true',
    };
    try {
      if (editId) await api.put(`/items/${editId}`, body);
      else await api.post('/items', body);
      flash(editId ? 'Item updated' : 'Item created');
      reset();
      load();
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  const edit = (i) => {
    setEditId(i.id);
    setForm({
      name: i.name,
      itemTypeId: String(i.itemTypeId),
      purchaseDate: i.purchaseDate,
      stockAvailable: String(i.stockAvailable),
      active: String(i.active),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = async (i) => {
    try {
      await api.patch(`/items/${i.id}/status`, { active: !i.active });
      flash(i.active ? 'Item deactivated' : 'Item activated');
      load();
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  const remove = async (i) => {
    if (!window.confirm(`Delete item "${i.name}"?`)) return;
    try {
      const { data } = await api.delete(`/items/${i.id}`);
      flash(data.message);
      load();
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  const view = async (i) => {
    try {
      setDetail((await api.get(`/items/${i.id}`)).data);
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  return (
    <section>
      <Alert msg={msg} />

      {isAdmin ? (
        <form className="card form-grid" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Item Name *</label>
            <input id="name" name="name" value={form.name} maxLength={100} onChange={change} />
          </div>
          <div className="field">
            <label htmlFor="itemTypeId">Item Type *</label>
            <select id="itemTypeId" name="itemTypeId" value={form.itemTypeId} onChange={change}>
              <option value="">-- Select type --</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.typeName}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="purchaseDate">Purchase Date *</label>
            <input id="purchaseDate" name="purchaseDate" type="date" value={form.purchaseDate} onChange={change} />
          </div>
          <div className="field">
            <label htmlFor="stockAvailable">Stock Available *</label>
            <input id="stockAvailable" name="stockAvailable" type="number" min="0" step="1"
                   value={form.stockAvailable} onChange={change} />
          </div>
          <div className="field">
            <label htmlFor="active">Status *</label>
            <select id="active" name="active" value={form.active} onChange={change}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="field actions">
            <button type="submit" className="btn primary">{editId ? 'Update Item' : 'Create Item'}</button>
            {editId && <button type="button" className="btn" onClick={reset}>Cancel</button>}
          </div>
        </form>
      ) : (
        <p className="note">You are logged in as USER: items are read-only. Ask an ADMIN to change them.</p>
      )}

      <div className="card flush">
      <div className="card-head pad">
        <h3>Product Inventory {q && <span className="muted">· search: "{q}"</span>}</h3>
        <label className="filter"><Icon name="filter" size={15} />
          <select aria-label="Filter by availability" value={avail} onChange={(e) => setAvail(e.target.value)}>
            <option value="">All</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Type</th><th>Purchase Date</th><th>Current Stock</th>
              <th>Availability</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={8} className="empty">No items found.</td></tr>}
            {shown.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.name}</td>
                <td>{i.typeName}</td>
                <td>{i.purchaseDate}</td>
                <td>{i.stockAvailable}</td>
                <td><AvailabilityBadge value={i.availability} /></td>
                <td><StatusBadge active={i.active} /></td>
                <td className="actions-cell">
                  <button className="icon-btn" title="View" aria-label="View" onClick={() => view(i)}><Icon name="eye" size={15} /></button>
                  {isAdmin && (
                    <>
                      <button className="icon-btn" title="Update" aria-label="Update" onClick={() => edit(i)}><Icon name="edit" size={15} /></button>
                      <button className="icon-btn" title={i.active ? 'Deactivate' : 'Activate'} aria-label={i.active ? 'Deactivate' : 'Activate'} onClick={() => toggle(i)}><Icon name="power" size={15} /></button>
                      <button className="icon-btn danger" title="Delete" aria-label="Delete" onClick={() => remove(i)}><Icon name="trash" size={15} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Item Details</h3>
            {[
              ['Item ID', detail.id],
              ['Name', detail.name],
              ['Type', detail.typeName],
              ['Purchase Date', detail.purchaseDate],
              ['Current Stock', detail.stockAvailable],
              ['Availability', detail.availability],
              ['Status', detail.active ? 'Active' : 'Inactive'],
              ['Used in purchases', detail.purchaseCount],
              ['Total quantity purchased', detail.totalPurchased],
              ['Can be deleted', detail.canDelete ? 'Yes' : 'No (has purchase history)'],
              ['Created', fmtDateTime(detail.createdAt)],
              ['Last updated', fmtDateTime(detail.updatedAt)],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}><span>{k}</span><span>{v}</span></div>
            ))}
            <button className="btn primary" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
