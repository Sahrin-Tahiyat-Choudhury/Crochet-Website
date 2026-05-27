/* =============================================
   THE YARN JOURNEY — Orders Page JS
   ============================================= */

const ORDERS = [
  { id:'TYJ-0148', customer:'Priya Sharma',    products:'Sunflower Bouquet × 2',    total:1698, payment:'Paid',    status:'Delivered', date:'27 May 2026' },
  { id:'TYJ-0147', customer:'Ananya Reddy',    products:'Rose Bunch (Pink) × 1',    total:699,  payment:'Paid',    status:'Shipped',   date:'26 May 2026' },
  { id:'TYJ-0146', customer:'Meera Iyer',      products:'Daisy Gift Set × 1',       total:1499, payment:'Pending', status:'Pending',   date:'26 May 2026' },
  { id:'TYJ-0145', customer:'Kavitha Nair',    products:'Lavender Wreath × 1',      total:1199, payment:'Paid',    status:'Shipped',   date:'25 May 2026' },
  { id:'TYJ-0144', customer:'Ritika Verma',    products:'Tulip Single Stem × 4',    total:1196, payment:'Paid',    status:'Delivered', date:'25 May 2026' },
  { id:'TYJ-0143', customer:'Sunita Patel',    products:'Spring Gift Box × 1',      total:2199, payment:'Pending', status:'Pending',   date:'24 May 2026' },
  { id:'TYJ-0142', customer:'Lakshmi Menon',   products:'Baby\'s Breath Set × 1',   total:1799, payment:'Paid',    status:'Processing',date:'24 May 2026' },
];

let activeFilter = 'all';
let searchQ = '';

function statusBadgeOrder(s) {
  const map = { 'Delivered':'badge-green','Shipped':'badge-blue','Processing':'badge-orange','Pending':'badge-yellow','Cancelled':'badge-red' };
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}

function paymentBadge(p) {
  return p === 'Paid'
    ? `<span class="badge badge-green">✔ Paid</span>`
    : `<span class="badge badge-yellow">⏳ Pending</span>`;
}

function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  let rows = ORDERS;
  if (activeFilter !== 'all') rows = rows.filter(o => o.status === activeFilter);
  if (searchQ) rows = rows.filter(o =>
    o.id.toLowerCase().includes(searchQ) ||
    o.customer.toLowerCase().includes(searchQ) ||
    o.products.toLowerCase().includes(searchQ)
  );

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="empty-icon">📦</div><h3>No orders found</h3>
      <p>Try a different filter or search term.</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(o => `
    <tr>
      <td><span style="font-weight:600;color:var(--accent);">${o.id}</span></td>
      <td>
        <div style="font-weight:500;">${o.customer}</div>
      </td>
      <td><span style="font-size:12.5px;color:var(--text-mid);">${o.products}</span></td>
      <td><strong>₹${o.total.toLocaleString('en-IN')}</strong></td>
      <td>${paymentBadge(o.payment)}</td>
      <td>${statusBadgeOrder(o.status)}</td>
      <td style="color:var(--text-muted);font-size:12px;">${o.date}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="View" onclick="viewOrder('${o.id}')">👁️</button>
          <button class="icon-btn" title="Invoice" onclick="showToast('Invoice downloaded','info')">📄</button>
          <button class="icon-btn danger" title="Cancel" onclick="showToast('Order cancelled','error')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterOrders(f) {
  activeFilter = f;
  document.querySelectorAll('[id^="tab-"]').forEach(b => {
    b.style.background = '';
    b.style.color = '';
    b.style.borderColor = '';
  });
  const active = document.getElementById('tab-' + f.toLowerCase());
  if (active) {
    active.style.background = 'var(--accent)';
    active.style.color = '#fff';
    active.style.borderColor = 'var(--accent)';
  }
  renderOrders();
}

function searchOrders(q) {
  searchQ = q.toLowerCase();
  renderOrders();
}

function viewOrder(id) {
  const o = ORDERS.find(x => x.id === id);
  if (!o) return;
  document.getElementById('orderDetailTitle').textContent = `Order ${o.id}`;
  document.getElementById('orderDetailBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div><div class="form-label">Customer</div><div style="font-weight:500;margin-top:4px;">${o.customer}</div></div>
      <div><div class="form-label">Date</div><div style="margin-top:4px;">${o.date}</div></div>
      <div><div class="form-label">Products</div><div style="margin-top:4px;">${o.products}</div></div>
      <div><div class="form-label">Total</div><div style="font-weight:700;font-size:16px;margin-top:4px;color:var(--accent);">₹${o.total.toLocaleString('en-IN')}</div></div>
      <div><div class="form-label">Payment</div><div style="margin-top:4px;">${o.payment}</div></div>
      <div><div class="form-label">Status</div><div style="margin-top:4px;">${o.status}</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">Update Status</label>
      <select class="form-select">
        <option ${o.status==='Pending'?'selected':''}>Pending</option>
        <option ${o.status==='Processing'?'selected':''}>Processing</option>
        <option ${o.status==='Shipped'?'selected':''}>Shipped</option>
        <option ${o.status==='Delivered'?'selected':''}>Delivered</option>
        <option ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Tracking Number</label>
      <input class="form-input" placeholder="Enter tracking number…" />
    </div>
    <div class="form-group">
      <label class="form-label">Note to Customer</label>
      <textarea class="form-textarea" placeholder="Optional message…"></textarea>
    </div>
  `;
  openModal('orderDetailModal');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('orders');
  renderOrders();
});
