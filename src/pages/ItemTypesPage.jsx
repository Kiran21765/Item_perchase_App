import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import useFlash from '../components/useFlash.js';

export default function ItemTypesPage() {
  const { isAdmin } = useAuth();
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [msg, flash] = useFlash();

  const load = useCallback(async () => {
    try {
      setTypes((await api.get('/item-types')).data);
    } catch (e) {
      flash(errMsg(e), 'error');
    }
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setName(''); setEditId(null); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/item-types/${editId}`, { typeName: name });
      else await api.post('/item-types', { typeName: name });
      flash(editId ? 'Item type updated' : 'Item type created');
      reset();
      load();
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete item type "${t.typeName}"?`)) return;
    try {
      const { data } = await api.delete(`/item-types/${t.id}`);
      flash(data.message);
      load();
    } catch (err) {
      flash(errMsg(err), 'error');
    }
  };

  return (
    <section>
      <Alert msg={msg} />
      {isAdmin ? (
        <form className="card form-inline" onSubmit={submit}>
          <div className="field">
            <label htmlFor="typeName">Type Name *</label>
            <input id="typeName" value={name} maxLength={100} placeholder="e.g. Electronics"
                   onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" className="btn primary">{editId ? 'Update Type' : 'Add Type'}</button>
          {editId && <button type="button" className="btn" onClick={reset}>Cancel</button>}
        </form>
      ) : (
        <p className="note">You are logged in as USER: item types are read-only.</p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Type Name</th><th>Items</th>{isAdmin && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {types.length === 0 && <tr><td colSpan={4} className="empty">No item types yet.</td></tr>}
            {types.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.typeName}</td>
                <td>{t.itemCount}</td>
                {isAdmin && (
                  <td className="actions-cell">
                    <button className="btn small" onClick={() => { setEditId(t.id); setName(t.typeName); }}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(t)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
