/* =============================================
   THE YARN JOURNEY — Products Page JS
   ============================================= */

let products = [];
let filteredProducts = [];
let currentPage = 1;
let editingProductId = null;

const PER_PAGE = 10;

async function loadProducts() {
  try {
    const data = await API.products.getAll();

    products = data.products || [];

    products.forEach(p => {
  console.log(
    p.name,
    "stock:", p.stockQuantity,
    "lowStockAlertAt:", p.lowStockAlertAt
  );
});
    console.log("sample product:", products[0]);


    filteredProducts = [...products];
    document.getElementById("totalProducts").textContent =products.length;

    const activeProducts = products.filter(
      p =>
        !p.isHidden && !p.isDraft && p.stockQuantity > 3
    ).length;
    
    console.log("activeProducts count:", activeProducts);
    document.getElementById("activeListings").textContent = activeProducts;

    const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 3).length;

    document.getElementById("lowStockCount").textContent = lowStock;

    const outOfStock = products.filter(
  p => p.stockQuantity === 0
).length;

    const outOfStockEl = document.getElementById("outOfStockCount");
    if (outOfStockEl) { outOfStockEl.textContent = outOfStock;}

    const discounts = products.filter(p => p.price?.originalPrice > p.price?.sellingPrice).length;
    document.getElementById("activeDiscounts").textContent = discounts;

    document.getElementById("productsSub").textContent = `${products.length} total products`;
    document.getElementById("activeListingsSub").textContent = `${activeProducts} active`;
    document.getElementById("lowStockSub").textContent = `${lowStock} low stock alerts`;
    document.getElementById("discountsSub").textContent =`${discounts} active discounts`;

    renderRows();
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Failed to load products", "error");
  }
}
function statusBadge(product) {
  let status = "Active";

  if (product.isDraft) {
  status = "Draft";
} else if (product.isHidden) {
  status = "Hidden";
} else if (product.stockQuantity === 0) {
  status = "Out of Stock";
} else if (product.stockQuantity <= 3) {
  status = "Low Stock";
} else {
  status = "Active";
}

  const map = {
    Active: "badge-green",
    Hidden: "badge-gray", 
    Draft: "badge-gray",
    "Low Stock": "badge-yellow",
    "Out of Stock": "badge-red"
  };

  return `<span class="badge ${map[status]}">${status}</span>`;
}

function renderRows() {
  const tbody = document.getElementById("productsTbody");

  const start = (currentPage - 1) * PER_PAGE;
  const slice = filteredProducts.slice(start, start + PER_PAGE);

  if (!slice.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">🌸</div>
            <h3>No products found</h3>
            <p>Try adjusting your search.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = slice.map(product => `
    <tr>
      <td>
        <div class="product-cell">
        <div class="product-img" 
        style="${product.uri && product.uri.startsWith('http') 
    ? `background-image:url('${product.uri}');background-size:cover;background-position:center;` 
    : ''}"> ${!product.uri || !product.uri.startsWith('http') ? "🌸" : ""}
    </div>

          <div>
            <div class="product-name">${product.name}</div>
            <div class="product-sku">${product._id}</div>
          </div>
        </div>
      </td>

      <td>
        ${product.category?.name || "Uncategorized"}
      </td>

      <td>
        <strong>
          ₹${(product.price?.sellingPrice || 0).toLocaleString("en-IN")}
        </strong>
      </td>

      <td>
      
  ${(product.colors || [])
    .map(
      color => `
        <span
          style="
            display:inline-block;
            width:16px;
            height:16px;
            border-radius:50%;
            background:${color};
            border:1px solid #ccc;
            margin-right:4px;
          "
          title="${color}"
        ></span>
      `
    )
    .join("") || "—"}
      </td>

      <td>
        <span style="
          font-weight:600;
          ${product.stockQuantity === 0
            ? "color:var(--red)"
            : product.stockQuantity <= 3
            ? "color:var(--yellow)"
            : ""}
        ">
          ${product.stockQuantity ?? 0}
        </span>
      </td>

      <td>
        ${statusBadge(product)}
      </td>

      <td>
        <div class="action-btns">
          <button
          class="icon-btn"
          title="Edit"
          onclick="openEditModal('${product._id}')"
          >
          ✏️
          </button>

          <button
            class="icon-btn danger"
            title="Delete"
            onclick="deleteProduct('${product._id}')"
          >
          🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  const total = filteredProducts.length;
  const end = Math.min(start + PER_PAGE, total);

  document.getElementById("paginationInfo").textContent =
    `Showing ${start + 1}–${end} of ${total} products`;

  renderPagination();
}

function filterProducts(query = "") {
  const q = query.toLowerCase();

  filteredProducts = products.filter(product =>
    (product.name || "").toLowerCase().includes(q) ||
    (product.description || "").toLowerCase().includes(q)
  );

  currentPage = 1;
  renderRows();
}
function sortProducts() {

  const sort =
    document.getElementById('sortSelect').value;

  switch (sort) {

    case 'price_asc':
      filteredProducts.sort(
        (a, b) =>
          (a.price?.sellingPrice || 0) -
          (b.price?.sellingPrice || 0)
      );
      break;

    case 'price_desc':
      filteredProducts.sort(
        (a, b) =>
          (b.price?.sellingPrice || 0) -
          (a.price?.sellingPrice || 0)
      );
      break;

    case 'name_asc':
      filteredProducts.sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );
      break;

    case 'name_desc':
      filteredProducts.sort(
        (a, b) =>
          b.name.localeCompare(a.name)
      );
      break;

    case 'newest':
      filteredProducts.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
      break;

    case 'oldest':
      filteredProducts.sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
      break;
  }

  renderRows();
}
function goPage(page) {
  currentPage = page;
  renderRows();
}
function applyFilters() {

  const category =
    document.getElementById(
      'categoryFilter'
    ).value;

  const status =
    document.getElementById(
      'statusFilter'
    ).value;

  filteredProducts =
    products.filter(product => {

      let categoryMatch =
        category === 'All Categories'
        ||
        product.category?.name === category;

      let productStatus =
        product.isDraft
          ? 'Draft'
          : product.stockQuantity === 0
          ? 'Out of Stock'
          : product.stockQuantity <= 3
          ? 'Low Stock'
          : 'Active';

      let statusMatch =
        status === 'All Status'
        ||
        status === productStatus;

      return (
        categoryMatch &&
        statusMatch
      );
    });

  renderRows();
}

async function loadCategories() {
    try {

        const data = await API.categories.getAll();

        console.log("Categories:", data);

        const categorySelect =
            document.getElementById('editCategory');

        categorySelect.innerHTML =
            '<option value="">Select Category</option>';

        data.categories.forEach(category => {

            categorySelect.innerHTML += `
                <option value="${category._id}">
                    ${category.name}
                </option>
            `;
        });

    } catch (error) {

        console.error(error);

        showToast(
            'Failed to load categories',
            'error'
        );
    }
}

async function deleteProduct(productId) {
  if (!confirm("Delete this product?")) return;

  try {
    await API.admin.deleteProduct(productId);

    showToast("Product deleted successfully", "success");

    await loadProducts();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to delete product", "error");
  }
}
function openEditModal(productId) {
  const product = products.find(
    p => p._id === productId
  );
  console.log(product);

  if (!product) return;

  document.getElementById('editProductId').value =
    product._id;

  document.getElementById('editProductName').value =
    product.name;

  document.getElementById('editProductDescription').value =
    product.description || '';

  document.getElementById('editOriginalPrice').value =
  product.price?.originalPrice ?? 0;

  document.getElementById('editSellingPrice').value =
  product.price?.sellingPrice ?? 0;

  document.getElementById('editStockQuantity').value =
  product.stockQuantity ?? 0;

  document.getElementById('lowStockAlertAt').value = product.lowStockAlertAt ?? 0;
  
  document.getElementById('editProductColors').value =
  (product.colors || []).join(',');

document.getElementById('editIsFeatured').checked =
  product.isFeatured || false;

const editStatus =
  document.getElementById('editStatus');

if (product.isDraft) {
  editStatus.value = 'draft';
} else if (product.isHidden) {
  editStatus.value = 'hidden';
} else {
  editStatus.value = 'active';
}

document.getElementById('editCategory').value = product.category?._id || '';

  openModal('editProductModal');
}

async function updateProduct() {
  try {

    const editStatus = document.getElementById('editStatus');

    const productData = {
      productId:
        document.getElementById('editProductId').value,

      name:
        document.getElementById('editProductName').value,

      description:
        document.getElementById('editProductDescription').value,

      originalPrice:
        Number(document.getElementById('editOriginalPrice').value),

      sellingPrice:
        Number(document.getElementById('editSellingPrice').value),
      
      colors:
      document.getElementById('editProductColors').value,

      isFeatured:
      document.getElementById('editIsFeatured').checked,

      isDraft:
      editStatus.value === 'draft',
      
      isHidden:
      editStatus.value === 'hidden',

      stockQuantity:
        Number(document.getElementById('editStockQuantity').value),

      lowStockAlertAt:
      Number(document.getElementById("lowStockAlertAt").value),

      category:
      document.getElementById('editCategory').value
    };

    console.log(productData);

    await API.admin.editProduct(productData);

    showToast(
      'Product updated successfully',
      'success'
    );

    closeModal('editProductModal');

    await loadProducts();

  } catch (error) {
    console.error(error);

    showToast(
      error.message || 'Failed to update product',
      'error'
    );
  }
}
function saveDraftProduct() {
  showToast("Draft saved", "success");

  closeModal("addProductModal");
}

function renderPagination() {

   console.log("filteredProducts.length:", filteredProducts.length);
  
   console.log("PER_PAGE:", PER_PAGE);

  const totalPages =
    Math.ceil(filteredProducts.length / PER_PAGE);
 
    console.log("totalPages:", totalPages);
 
   const container =
    document.querySelector(".pagination-pages");

  let html = "";

  for (let i = 1; i <= totalPages; i++) {

    html += `
      <button
        class="page-btn ${i === currentPage ? "active" : ""}"
        onclick="goPage(${i})"
      >
        ${i}
      </button>
    `;
  }

  container.innerHTML = html;
}

function exportProductsCSV() {

  if (!products.length) {
    showToast("No products to export", "error");
    return;
  }

  const headers = [
    "name",
    "description",
    "originalPrice",
    "sellingPrice",
    "stockQuantity",
    "colors",
    "isFeatured",
    "isDraft",
    "isHidden",
    "category",
    "uri"
  ];

  const rows = products.map(product => [
    product.name,
    product.description,
    product.price?.originalPrice,
    product.price?.sellingPrice,
    product.stockQuantity,
    (product.colors || []).join(","),
    product.isFeatured,
    product.isDraft,
    product.isHidden,
    product.category,
    product.uri
  ]);

  const csvContent =
    [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

  const blob = new Blob(
    [csvContent],
    { type: "text/csv" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "products.csv";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);

  showToast(
    "Products exported successfully",
    "success"
  );
}

async function importProducts() {
  try {

    const file =
      document.getElementById('csvFile').files[0];

    if (!file) {
      showToast('Select a CSV file', 'error');
      return;
    }

    const formData = new FormData();
    
    formData.append('csv', file); 

    const response =
      await API.admin.importProducts(formData);

    showToast(
      `${response.count} products imported`,
      'success'
    );

    await loadProducts();

  } catch (error) {

    console.error(error);

    showToast(
      error.message,
      'error'
    );
  }
}





document.addEventListener("DOMContentLoaded", async () => {
  loadAdminTheme(); // Load theme first
  
  renderSidebar("products");
  initToggles();

  await loadCategories();
  await loadProducts();
});
