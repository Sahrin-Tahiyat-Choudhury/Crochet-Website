/* =============================================
   THE YARN JOURNEY — Products Page JS
   ============================================= */

const PRODUCTS = [
  { id:1, name:'Sunflower Bouquet', sku:'TYJ-001', category:'Flower Bouquets', price:849, colors:['#f5c518','#8B4513','#228B22'], stock:12, status:'Active' },
  { id:2, name:'Rose Bunch (Pink)',  sku:'TYJ-002', category:'Flower Bouquets', price:699, colors:['#FFB6C1','#ff69b4','#c71585'], stock:8,  status:'Active' },
  { id:3, name:'Lavender Wreath',    sku:'TYJ-003', category:'Wreaths',         price:1199,colors:['#9370DB','#DDA0DD','#228B22'], stock:5,  status:'Active' },
  { id:4, name:'Daisy Gift Set',     sku:'TYJ-004', category:'Gift Sets',       price:1499,colors:['#fff','#FFD700','#90EE90'],   stock:3,  status:'Low Stock' },
  { id:5, name:'Tulip Single Stem',  sku:'TYJ-005', category:'Single Flowers',  price:299, colors:['#FF6347','#FF4500'],          stock:20, status:'Active' },
  { id:6, name:'Peony Bouquet',      sku:'TYJ-006', category:'Flower Bouquets', price:999, colors:['#FFB7C5','#FF69B4','#fff'],   stock:0,  status:'Out of Stock' },
  { id:7, name:'Eucalyptus Wreath',  sku:'TYJ-007', category:'Wreaths',         price:1349,colors:['#2E8B57','#3CB371'],          stock:6,  status:'Active' },
  { id:8, name:'Carnation Mix',      sku:'TYJ-008', category:'Flower Bouquets', price:549, colors:['#FF6347','#fff','#FF1493'],   stock:2,  status:'Low Stock' },
  { id:9, name:'Baby\'s Breath Set', sku:'TYJ-009', category:'Gift Sets',       price:1799,colors:['#fff','#E6E6FA'],             stock:9,  status:'Active' },
  { id:10,name:'Crochet Bookmark',   sku:'TYJ-010', category:'Accessories',     price:149, colors:['#e8916a','#d4a07a'],          stock:35, status:'Active' },
  { id:11,name:'Marigold Bunch',     sku:'TYJ-011', category:'Flower Bouquets', price:449, colors:['#FF8C00','#FFD700'],          stock:14, status:'Active' },
  { id:12,name:'Lily Wreath',        sku:'TYJ-012', category:'Wreaths',         price:1099,colors:['#fff','#FFE4B5','#98FB98'],   stock:7,  status:'Active' },
  { id:13,name:'Hibiscus Hairpin',   sku:'TYJ-013', category:'Accessories',     price:199, colors:['#DC143C','#FF6347'],          stock:1,  status:'Low Stock' },
  { id:14,name:'Spring Gift Box',    sku:'TYJ-014', category:'Gift Sets',       price:2199,colors:['#FFB6C1','#90EE90','#FFD700'],stock:4,  status:'Draft' },
  { id:15,name:'Chrysanthemum Stem', sku:'TYJ-015', category:'Single Flowers',  price:249, colors:['#fff','#DDA0DD'],             stock:18, status:'Active' },
];

let currentPage = 1;
const PER_PAGE = 10;
let filteredProducts = [...PRODUCTS];

function statusBadge(s) {
  const map = {
    'Active': 'badge-green',
    'Draft': 'badge-gray',
    'Low Stock': 'badge-yellow',
    'Out of Stock': 'badge-red',
  };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

function colorDots(colors) {
  return `<div class="color-dots">${colors.map(c => `<div class="color-dot" style="background:${c};" title="${c}"></div>`).join('')}</div>`;
}

function renderRows() {
  const tbody = document.getElementById('productsTbody');
  const start = (currentPage - 1) * PER_PAGE;
  const slice = filteredProducts.slice(start, start + PER_PAGE);

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <div class="empty-icon">🌸</div>
      <h3>No products found</h3>
      <p>Try adjusting your search or filters.</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = slice.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="product-img">🌸</div>
          <div>
            <div class="product-name">${p.name}</div>
            <div class="product-sku">${p.sku}</div>
          </div>
        </div>
      </td>
      <td><span style="color:var(--text-mid);font-size:13px;">${p.category}</span></td>
      <td><strong>₹${p.price.toLocaleString('en-IN')}</strong></td>
      <td>${colorDots(p.colors)}</td>
      <td>
        <span style="font-weight:600;${p.stock === 0 ? 'color:var(--red)' : p.stock <= 3 ? 'color:var(--yellow)' : ''}">${p.stock}</span>
      </td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="Edit" onclick="showToast('Opening editor…','info')">✏️</button>
          <button class="icon-btn" title="Duplicate" onclick="showToast('Product duplicated','success')">📋</button>
          <button class="icon-btn danger" title="Delete" onclick="deleteProduct(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Update pagination info
  const total = filteredProducts.length;
  const end = Math.min(start + PER_PAGE, total);
  document.getElementById('paginationInfo').textContent =
    `Showing ${start + 1}–${end} of ${total} products`;
}

function filterProducts(query) {
  const q = (query || '').toLowerCase();
  filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  currentPage = 1;
  renderRows();
}

function goPage(n) {
  currentPage = n;
  renderRows();
  // Update active page button styling
  document.querySelectorAll('.page-btn').forEach((btn, i) => {
    if (i > 0 && i < 4) btn.classList.toggle('active', i === n);
  });
}

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) PRODUCTS.splice(idx, 1);
  filterProducts();
  showToast('Product deleted', 'error');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('products');
  initToggles();
  renderRows();
});
