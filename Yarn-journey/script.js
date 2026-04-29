/* =============================================
   The Yarn Journey — JavaScript
   script.js
   ============================================= */

const products = [
  { id:1, name:'Blush Rose Bouquet', cat:'bouquets', icon:'🌹', mrp:699, sell:559, date:'2026-01-01', desc:'A dreamy blush rose bouquet with 12 handcrafted crochet roses in soft pink and cream. Perfect for gifting or home décor.', shipping:'Dispatched in 3–5 days. Ships nationwide across India.', material:'Premium acrylic yarn. Dust gently to clean. Keep away from moisture.', rating:4.9, reviews:47 },
  { id:2, name:'Sunflower Delight', cat:'bouquets', icon:'🌻', mrp:649, sell:499, date:'2026-01-15', desc:'Bright and cheerful sunflower bouquet with 8 large crochet sunflowers and green foliage. Brings sunshine to any room!', shipping:'Dispatched in 3–5 days. Ships nationwide across India.', material:'Premium acrylic yarn. Dust gently to clean. Keep away from moisture.', rating:4.8, reviews:32 },
  { id:3, name:'Pastel Tulip Mix', cat:'bouquets', icon:'🌷', mrp:799, sell:649, date:'2026-02-01', desc:'A pastel rainbow of crochet tulips — lilac, peach, cream, and mint — beautifully arranged in a gift-ready wrap.', shipping:'Dispatched in 3–5 days. Ships nationwide across India.', material:'Premium acrylic yarn. Dust gently to clean. Keep away from moisture.', rating:5.0, reviews:28 },
  { id:4, name:'Wildflower Meadow', cat:'bouquets', icon:'🌸', mrp:749, sell:599, date:'2026-02-10', desc:'A whimsical mix of daisies, baby\'s breath, and wild blooms — the perfect boho-style crochet bouquet.', shipping:'Dispatched in 3–5 days. Ships nationwide across India.', material:'Premium acrylic yarn. Dust gently to clean. Keep away from moisture.', rating:4.7, reviews:19 },
  { id:5, name:'Mini Rose Posy', cat:'mini', icon:'🥀', mrp:349, sell:249, date:'2025-12-01', desc:'A sweet little mini bouquet with 5 crochet roses in your choice of color. Perfectly sized for a desk or bedside table.', shipping:'Dispatched in 3–5 days.', material:'Soft acrylic yarn.', rating:5.0, reviews:61 },
  { id:6, name:'Tiny Tulip Bunch', cat:'mini', icon:'🌷', mrp:299, sell:219, date:'2025-12-15', desc:'5 petite crochet tulips in pastel shades. Adorable, affordable, and absolutely charming!', shipping:'Dispatched in 3–5 days.', material:'Soft acrylic yarn.', rating:4.9, reviews:44 },
  { id:7, name:'Mini Daisy Cluster', cat:'mini', icon:'🌼', mrp:279, sell:199, date:'2026-01-20', desc:'7 tiny daisies in white and yellow — the sweetest little desk accessory or gift topper!', shipping:'Dispatched in 3–5 days.', material:'Soft acrylic yarn.', rating:4.8, reviews:37 },
  { id:8, name:'Strawberry Charm', cat:'keychain', icon:'🍓', mrp:199, sell:149, date:'2025-11-01', desc:'An adorable handmade crochet strawberry keychain — the cutest accessory for your bag, keys, or pencil case!', shipping:'Dispatched in 2–3 days.', material:'Cotton yarn, metal ring.', rating:5.0, reviews:112 },
  { id:9, name:'Flower Blossom Key', cat:'keychain', icon:'🌸', mrp:179, sell:139, date:'2025-11-15', desc:'A tiny crochet flower keychain in your favorite color. Dainty, cute, and handcrafted.', shipping:'Dispatched in 2–3 days.', material:'Cotton yarn, metal ring.', rating:4.9, reviews:88 },
  { id:10, name:'Mushroom Buddy Key', cat:'keychain', icon:'🍄', mrp:199, sell:159, date:'2025-12-20', desc:'A quirky little crochet mushroom keychain — makes a great gift for nature lovers!', shipping:'Dispatched in 2–3 days.', material:'Cotton yarn, metal ring.', rating:4.9, reviews:73 },
  { id:11, name:'Sunflower Desk Buddy', cat:'desk', icon:'🌻', mrp:299, sell:229, date:'2025-10-01', desc:'A cheerful crochet sunflower in a tiny clay pot — perfect for your study table, office, or windowsill!', shipping:'Dispatched in 3–5 days. Fragile — handle with care.', material:'Acrylic yarn, clay pot base.', rating:5.0, reviews:56 },
  { id:12, name:'Cactus Cuties', cat:'desk', icon:'🌵', mrp:279, sell:219, date:'2025-10-15', desc:'A set of 3 mini crochet cacti in tiny terracotta pots. Zero maintenance, maximum cuteness!', shipping:'Dispatched in 3–5 days.', material:'Acrylic yarn, clay pots.', rating:4.8, reviews:41 },
  { id:13, name:'Rose Wreath', cat:'decor', icon:'🏡', mrp:899, sell:749, date:'2026-01-05', desc:'A beautiful crochet rose wreath for your front door or wall. Made with 24 roses in your chosen colors, approx. 35cm diameter.', shipping:'Dispatched in 5–7 days. Ships in protective packaging.', material:'Premium acrylic yarn, wire frame.', rating:4.9, reviews:23 },
  { id:14, name:'Floral Wall Hanging', cat:'decor', icon:'🎀', mrp:799, sell:649, date:'2026-01-25', desc:'A boho-style wall hanging with crochet flowers and fringe — adds a warm, handmade touch to any room.', shipping:'Dispatched in 5–7 days.', material:'Cotton yarn, wooden dowel.', rating:4.7, reviews:18 },
];

let cart = [];
let activeFilter = 'all';

function renderProducts(data) {
  const grid = document.getElementById('products-grid');
  if (!data.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--brown-light);font-family:var(--font-display);font-size:20px">No products found 🌸</div>'; return; }
  grid.innerHTML = data.map(p => {
    const disc = Math.round((1 - p.sell/p.mrp)*100);
    return `<div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:70px;background:var(--blush-mid)">${p.icon}</div>
        <div class="product-badge">${disc}% OFF</div>
        <button class="product-wishlist" onclick="event.stopPropagation();this.textContent=this.textContent=='🤍'?'❤️':'🤍';showToast('Wishlist updated!')">🤍</button>
        <button class="product-quick-add" onclick="event.stopPropagation();addToCart(${p.id})">+ Quick Add to Cart</button>
      </div>
      <div class="product-info">
        <div class="product-cat-tag">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <span class="price-sell">₹${p.sell}</span>
          <span class="price-mrp">₹${p.mrp}</span>
          <span class="price-off">${disc}% Off</span>
        </div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterProducts(cat, btn) {
  activeFilter = cat;
  if (btn) { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
  const filtered = cat === 'all' ? products : products.filter(p => p.cat === cat);
  renderProducts(filtered);
}

function sortProducts(val) {
  let data = activeFilter === 'all' ? [...products] : products.filter(p => p.cat === activeFilter);
  if (val === 'low') data.sort((a,b) => a.sell - b.sell);
  else if (val === 'high') data.sort((a,b) => b.sell - a.sell);
  else if (val === 'az') data.sort((a,b) => a.name.localeCompare(b.name));
  else if (val === 'new') data.sort((a,b) => new Date(b.date) - new Date(a.date));
  renderProducts(data);
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({...p, qty:1});
  updateCart();
  showToast(`🛒 ${p.name} added to cart!`);
}

function updateCart() {
  const badge = document.getElementById('cart-badge');
  const total = cart.reduce((s,x) => s + x.qty, 0);
  badge.textContent = total;
  const wrap = document.getElementById('cart-items-wrap');
  if (!cart.length) {
    wrap.innerHTML = '<div class="cart-empty"><span class="ce-icon">🛒</span>Your cart is empty.<br><small style="font-size:14px;margin-top:8px;display:block">Add some handcrafted magic!</small></div>';
  } else {
    wrap.innerHTML = cart.map(item => `<div class="cart-item">
      <div class="cart-item-img"><span style="font-size:30px">${item.icon}</span></div>
      <div style="flex:1">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.sell}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
          <button onclick="removeItem(${item.id})" style="margin-left:8px;background:none;border:none;cursor:pointer;color:var(--brown-light);font-size:18px">🗑</button>
        </div>
      </div>
      <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--dark)">₹${(item.sell * item.qty)}</div>
    </div>`).join('');
  }
  document.getElementById('cart-total').textContent = `₹${cart.reduce((s,x) => s + x.sell*x.qty, 0).toFixed(2)}`;
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  updateCart();

}
function removeItem(id) { cart = cart.filter(x => x.id !== id); updateCart(); showToast('Item removed from cart'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('open'); document.getElementById('cart-overlay').classList.toggle('open'); }

function openModal(id) {
  const p = products.find(x => x.id === id);
  const disc = Math.round((1 - p.sell/p.mrp)*100);
  document.getElementById('modal-img').innerHTML = `<span style="font-size:80px">${p.icon}</span>`;
  document.getElementById('modal-details').innerHTML = `
    <div class="product-cat-tag">${p.cat}</div>
    <div class="modal-product-name">${p.name}</div>
    <div class="product-price" style="margin-bottom:14px">
      <span class="price-sell">₹${p.sell}</span>
      <span class="price-mrp">₹${p.mrp}</span>
      <span class="price-off">${disc}% Off</span>
    </div>
    <div class="product-rating" style="margin-bottom:16px">
      <span class="stars">${'★'.repeat(Math.round(p.rating))}</span>
      <span class="rating-count">${p.rating} · ${p.reviews} reviews</span>
    </div>
    <div class="modal-info-tabs">
      <button class="tab-btn active" onclick="switchTab(this,'desc')">Description</button>
      <button class="tab-btn" onclick="switchTab(this,'ship')">Shipping</button>
      <button class="tab-btn" onclick="switchTab(this,'care')">Care</button>
    </div>
    <div class="tab-content active" id="tab-desc">${p.desc}</div>
    <div class="tab-content" id="tab-ship">${p.shipping}</div>
    <div class="tab-content" id="tab-care">${p.material}</div>
    <div class="qty-selector">
      <span class="qty-label">Quantity:</span>
      <button class="qty-btn" onclick="document.getElementById('m-qty').textContent=Math.max(1,+document.getElementById('m-qty').textContent-1)">−</button>
      <span class="qty-num" id="m-qty">1</span>
      <button class="qty-btn" onclick="document.getElementById('m-qty').textContent=+document.getElementById('m-qty').textContent+1">+</button>
    </div>
    <button class="btn-primary" style="width:100%;padding:15px;margin-bottom:10px;font-size:15px" onclick="addToCart(${p.id});closeModal()">Add to Cart 🛒</button>
    <button class="btn-outline" style="width:100%;padding:14px" onclick="showToast('♡ Added to wishlist!')">Add to Wishlist ♡</button>
  `;
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() { document.getElementById('product-modal').classList.remove('open'); document.body.style.overflow = ''; }

function switchTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

function switchPolicy(btn, panel) {
  document.querySelectorAll('.policy-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.policy-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('policy-' + panel).classList.add('active');
}

function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

function toggleMobileNav() { document.getElementById('mobile-nav').classList.toggle('open'); document.getElementById('mobile-overlay').classList.toggle('open'); }
function slideReviews(dir) { document.getElementById('reviews-slider').scrollBy({ left: dir * 310, behavior: 'smooth' }); }
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
function toggleSearch() { showToast('🔍 Search coming soon!'); }
function openCustomModal(name, price, stems) { showToast(`✨ ${name} selected — scroll to Custom Order!`); setTimeout(() => document.getElementById('custom').scrollIntoView({behavior:'smooth'}), 500); }

renderProducts(products);
updateCart();
