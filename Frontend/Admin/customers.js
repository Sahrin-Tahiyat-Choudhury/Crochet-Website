/* =============================================
   THE YARN JOURNEY — Customers Page JS
   ============================================= */

const CUSTOMERS = [
  { id:1, name:'Priya Sharma',   phone:'+91 98765 43210', city:'Mumbai',    orders:8, spent:8413, last:'27 May 2026', avatar:'P' },
  { id:2, name:'Ananya Reddy',   phone:'+91 87654 32109', city:'Hyderabad', orders:5, spent:4291, last:'26 May 2026', avatar:'A' },
  { id:3, name:'Meera Iyer',     phone:'+91 76543 21098', city:'Chennai',   orders:3, spent:3896, last:'26 May 2026', avatar:'M' },
  { id:4, name:'Kavitha Nair',   phone:'+91 65432 10987', city:'Kochi',     orders:6, spent:6048, last:'25 May 2026', avatar:'K' },
  { id:5, name:'Ritika Verma',   phone:'+91 54321 09876', city:'Delhi',     orders:4, spent:3292, last:'25 May 2026', avatar:'R' },
  { id:6, name:'Sunita Patel',   phone:'+91 43210 98765', city:'Ahmedabad', orders:2, spent:4398, last:'24 May 2026', avatar:'S' },
  { id:7, name:'Lakshmi Menon',  phone:'+91 32109 87654', city:'Bangalore', orders:7, spent:7123, last:'24 May 2026', avatar:'L' },
  { id:8, name:'Deepa Thomas',   phone:'+91 21098 76543', city:'Pune',      orders:1, spent:849,  last:'23 May 2026', avatar:'D' },
  { id:9, name:'Sanya Khanna',   phone:'+91 10987 65432', city:'Delhi',     orders:3, spent:2397, last:'22 May 2026', avatar:'S' },
  { id:10,name:'Aruna Pillai',   phone:'+91 90876 54321', city:'Chennai',   orders:9, spent:9200, last:'21 May 2026', avatar:'A' },
];

let searchQ = '';

function avatarColor(i) {
  const colors = ['#e8916a','#4caf82','#4a7fc1','#9370DB','#e6a817','#e05c5c'];
  return colors[i % colors.length];
}

function renderCustomers() {
  const tbody = document.getElementById('customersTbody');
  let rows = searchQ
    ? CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(searchQ) ||
        c.city.toLowerCase().includes(searchQ) ||
        c.phone.includes(searchQ)
      )
    : CUSTOMERS;

  tbody.innerHTML = rows.map((c, i) => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="product-img" style="background:${avatarColor(i)};color:#fff;font-weight:600;font-size:15px;">${c.avatar}</div>
          <div>
            <div class="product-name">${c.name}</div>
            ${c.orders >= 5 ? '<span class="badge badge-orange" style="font-size:10px;">⭐ Loyal</span>' : ''}
          </div>
        </div>
      </td>
      <td style="color:var(--text-mid);font-size:13px;">${c.phone}</td>
      <td><span class="badge badge-blue">${c.city}</span></td>
      <td><strong>${c.orders}</strong></td>
      <td><strong>₹${c.spent.toLocaleString('en-IN')}</strong></td>
      <td style="color:var(--text-muted);font-size:12px;">${c.last}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="View Profile" onclick="viewCustomer(${c.id})">👁️</button>
          <button class="icon-btn" title="Message" onclick="showToast('Opening chat with ${c.name}…','info')">💌</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchCustomers(q) {
  searchQ = q.toLowerCase();
  renderCustomers();
}

function viewCustomer(id) {
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return;
  document.getElementById('customerModalTitle').textContent = c.name;
  document.getElementById('customerModalBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-light);">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">${c.avatar}</div>
      <div>
        <div style="font-size:17px;font-weight:600;">${c.name}</div>
        <div style="color:var(--text-muted);font-size:13px;">${c.phone} · ${c.city}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:18px;">
      <div style="text-align:center;background:var(--accent-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--accent);">${c.orders}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Orders</div>
      </div>
      <div style="text-align:center;background:var(--green-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--green);">₹${c.spent.toLocaleString('en-IN')}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Spent</div>
      </div>
      <div style="text-align:center;background:var(--blue-soft);border-radius:8px;padding:14px;">
        <div style="font-size:20px;font-weight:700;color:var(--blue);">${c.city}</div>
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">City</div>
      </div>
    </div>
    <div class="form-label" style="margin-bottom:8px;">Recent Orders</div>
    <div style="background:#faf5f1;border-radius:8px;padding:12px;font-size:13px;color:var(--text-mid);">
      Last order placed on <strong>${c.last}</strong>. View full order history in the Orders section.
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label class="form-label">Message Customer</label>
      <textarea class="form-textarea" placeholder="Write a note or message…"></textarea>
    </div>
  `;
  openModal('customerModal');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('customers');
  renderCustomers();
});
