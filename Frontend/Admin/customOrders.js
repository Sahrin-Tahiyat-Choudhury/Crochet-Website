async function loadCustomOrders() {
  const data = await fetchJson(`${API_BASE}/customOrder/custom-orders`);

  const orders = data.orders || [];

  const container = document.getElementById('custom-orders');

  container.innerHTML = orders.map(o => `
    <div class="order-card">

      <h3>${o.name}</h3>
      <p>📞 ${o.contact}</p>

      <p><b>Product Type:</b> ${o.productType}</p>
      <p><b>Flowers:</b> ${(o.flowerSelection || []).join(', ')}</p>
      <p><b>Wrapper:</b> ${o.wrapperStyle || 'N/A'}</p>
      <p><b>Budget:</b> ₹${o.budget || 'Not specified'}</p>
      <p><b>Quantity:</b> ${o.quantity}</p>

      <p><b>Description:</b> ${o.description}</p>

      ${o.referenceImage ? `<img src="${o.referenceImage}" style="width:120px;border-radius:8px">` : ''}

      <div style="margin-top:10px">
        <button onclick="contactCustomer('${o.contact}')">
          📞 Contact Customer
        </button>
      </div>

    </div>
  `).join('');
}

function contactCustomer(contact) {
  const cleaned = contact.toString().replace(/\D/g, '');

  const isPhone = cleaned.length >= 10 && cleaned.length <= 15;

  if (isPhone) {
    let number = cleaned;
    if (number.length === 10) number = '91' + number;

    window.open(`https://wa.me/${number}`, '_blank');
  } else {
    window.location.href = `mailto:${contact}`;
  }
}