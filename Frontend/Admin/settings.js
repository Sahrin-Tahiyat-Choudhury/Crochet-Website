
function setToggle(id, value) {
  document
    .getElementById(id)
    .classList.toggle("on", value);
}

function initToggles() {
  document.querySelectorAll(".toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("on");
    });
  });
}
function changeTheme(color) {
  document.documentElement.style.setProperty(
    "--accent",
    color
  );

  document.documentElement.style.setProperty(
    "--accent-hover",
    adjustBrightness(color, -15)
  );

  document.documentElement.style.setProperty(
    "--accent-soft",
    adjustAlpha(color, 0.15)
  );

  localStorage.setItem(
    "adminThemeColor",
    color
  );

  showToast(
    "Color theme updated",
    "success"
  );
}

async function loadStoreSettings() {

  try {

    const data =
      await API.settings.get();

    console.log(data);

    
    const settings = data;
    const p = settings.payments;
    const s = settings.shipping;
    const a = settings.appearance;
    const n = settings.notifications;

    
    setToggle(
  "codAvailable",
  s.codAvailable
);
setToggle("newOrder", n.newOrder);
setToggle("orderStatusUpdated", n.orderStatusUpdated);
setToggle("lowStockAlert", n.lowStockAlert);
setToggle("newCustomer", n.newCustomer);
setToggle("promoCodeUsed", n.promoCodeUsed);
setToggle("dailySummary", n.dailySummary);
setToggle("weeklyReport", n.weeklyReport);
setToggle("productReview", n.productReview);

setToggle("upiEnabled", p.upiEnabled);
setToggle("codEnabled", p.codEnabled);
setToggle("bankTransferEnabled", p.bankTransferEnabled);
setToggle("cardEnabled", p.cardEnabled);



    document.getElementById(
      "storeName"
    ).value =
      settings.storeName || "";

    document.getElementById(
      "tagline"
    ).value =
      settings.tagline || "";

    document.getElementById(
      "description"
    ).value =
      settings.description || "";

    document.getElementById(
      "contactEmail"
    ).value =
      settings.contactEmail || "";

    document.getElementById(
      "contactPhone"
    ).value =
      settings.contactPhone || "";

    document.getElementById(
      "address"
    ).value =
      settings.address || "";

    document.getElementById(
      "currency"
    ).value =
      settings.currency || "INR";
    
    document.getElementById("upiId").value =
    p.upiId || "";
    
    document.getElementById("bankAccountName").value =
    p.bankAccountName || "";

    document.getElementById("ifscCode").value =
    p.ifscCode || "";

    document.getElementById("shippingFee").value =
    s.fee;

    document.getElementById("freeShippingAbove").value =
    s.freeShippingAbove;

    document.getElementById("deliveryTime").value =
    s.deliveryTime;

    document.getElementById("shippingZone").value =
    s.zone;

    document.getElementById("interfaceTheme").value =
    a.interfaceTheme;

  } catch(error) {

    console.error(error);

    showToast(
      "Failed to load settings",
      "error"
    );
  }
}

async function saveStoreSettings() {
console.log(
  document.getElementById("promoCodeUsed")
);
  const payload = {

    storeName: document.getElementById("storeName").value,
    tagline: document.getElementById("tagline").value,
    description: document.getElementById("description").value,
    contactEmail: document.getElementById("contactEmail").value,
    contactPhone: document.getElementById("contactPhone").value,
    address: document.getElementById("address").value,
    currency: document.getElementById("currency").value,

    notifications: {
      newOrder: document.getElementById("newOrder").classList.contains("on"),
      orderStatusUpdated: document.getElementById("orderStatusUpdated").classList.contains("on"),
      lowStockAlert: document.getElementById("lowStockAlert").classList.contains("on"),
      newCustomer: document.getElementById("newCustomer").classList.contains("on"),
      promoCodeUsed: document.getElementById("promoCodeUsed").classList.contains("on"),
      dailySummary: document.getElementById("dailySummary").classList.contains("on"),
      weeklyReport: document.getElementById("weeklyReport").classList.contains("on"),
      productReview: document.getElementById("productReview").classList.contains("on")
    },

    payments: {
      upiEnabled: document.getElementById("upiEnabled").classList.contains("on"),
      codEnabled: document.getElementById("codEnabled").classList.contains("on"),
      bankTransferEnabled: document.getElementById("bankTransferEnabled").classList.contains("on"),
      cardEnabled: document.getElementById("cardEnabled").classList.contains("on"),
      upiId: document.getElementById("upiId").value,
      bankAccountName: document.getElementById("bankAccountName").value,
      ifscCode: document.getElementById("ifscCode").value
    },

    shipping: {
      fee: Number(document.getElementById("shippingFee").value),
      freeShippingAbove: Number(document.getElementById("freeShippingAbove").value),
      deliveryTime: document.getElementById("deliveryTime").value,
      zone: document.getElementById("shippingZone").value,
      codAvailable: document.getElementById("codAvailable").classList.contains("on")
    },

    appearance: {
      interfaceTheme: document.getElementById("interfaceTheme").value
    }
  };

  console.log(payload);

  await API.settings.update(payload);
  
  // Save theme to localStorage so it persists across pages
  localStorage.setItem("adminInterfaceTheme", payload.appearance.interfaceTheme);
  applyInterfaceTheme(payload.appearance.interfaceTheme);
  
  showToast(
  "Settings saved",
  "success"
);
}

async function loadProfile() {
  try {

    const data =
      await API.users.getMe();

    const user = data.user;

    console.log(user);

    const names =
      (user.username || "")
        .split(" ");
    

    document.getElementById(
      "username"
    ).value =
      names[0] || "";

    document.getElementById(
      "email"
    ).value =
      user.email || "";
    
    document.getElementById(
        "phone"
    ).value =
    user.phone || "";

document.getElementById(
  "city"
).value =
  user.city || "";

// Display profile photo if it exists
if (user.photo) {
  const photoDisplay = document.getElementById("profilePhotoDisplay");
  photoDisplay.style.backgroundImage = `url(${user.photo})`;
  photoDisplay.style.backgroundSize = "cover";
  photoDisplay.style.backgroundPosition = "center";
  photoDisplay.textContent = "";
}

  } catch (error) {

    console.error(error);

    showToast(
      "Failed to load profile",
      "error"
    );
  }
}

async function saveProfile() {

  try {

    const username =
      document.getElementById(
        "username"
      ).value.trim();

    const email =
      document.getElementById(
        "email"
      ).value.trim();

    const phone =
    document.getElementById(
        "phone"
    ).value.trim();
    
    const city =
    document.getElementById(
        "city"
    ).value.trim();

    await API.users.updateProfile({
    username,
    email,
    phone,
    city
});

    showToast(
      "Profile updated",
      "success"
    );

  } catch (error) {

    console.error(error);

    showToast(
      error.message,
      "error"
    );
  }
}

async function changePassword() {

  try {

    const currentPassword =
      document.getElementById(
        "currentPassword"
      ).value;

    const newPassword =
      document.getElementById(
        "newPassword"
      ).value;

    const confirmPassword =
      document.getElementById(
        "confirmPassword"
      ).value;

    if (
      newPassword !==
      confirmPassword
    ) {
      return showToast(
        "Passwords do not match",
        "error"
      );
    }

    await API.users.changePassword({
    currentPassword,
    newPassword
});

    showToast(
      "Password updated",
      "success"
    );

  } catch (error) {

    console.error(error);

    showToast(
      error.message,
      "error"
    );
  }
}

function showPanel(event, id) {

  document
    .querySelectorAll(".settings-panel")
    .forEach(panel =>
      panel.classList.remove("active")
    );

  document
    .querySelectorAll(".settings-nav-item")
    .forEach(item =>
      item.classList.remove("active")
    );

  document
    .getElementById(`panel-${id}`)
    .classList.add("active");

  event.currentTarget.classList.add("active");
}


window.showPanel = showPanel;

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const btn = document.getElementById("changePhotoBtn");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Compressing...";

  try {
    // Compress image first
    compressImage(file, async (compressedBase64) => {
      btn.textContent = "Uploading...";
      
      try {
        await API.users.uploadPhoto({ photo: compressedBase64 });
        
        const photoDisplay = document.getElementById("profilePhotoDisplay");
        photoDisplay.style.backgroundImage = `url(${compressedBase64})`;
        photoDisplay.style.backgroundSize = "cover";
        photoDisplay.style.backgroundPosition = "center";
        photoDisplay.textContent = "";
        
        showToast("Photo updated successfully", "success");
      } catch (error) {
        console.error(error);
        showToast("Failed to upload photo", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        event.target.value = "";
      }
    });
  } catch (error) {
    console.error(error);
    showToast("Error processing image", "error");
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

window.handlePhotoUpload = handlePhotoUpload;

function compressImage(file, callback, maxWidth = 400, maxHeight = 400, quality = 0.7) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const reader2 = new FileReader();
        reader2.readAsDataURL(blob);
        reader2.onload = (e2) => {
          callback(e2.target.result);
        };
      }, "image/jpeg", quality);
    };
  };
}

window.compressImage = compressImage;

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    loadAdminTheme(); // Load theme first

    renderSidebar("settings");

    initToggles();

    await loadProfile();

    await loadStoreSettings();

    document.getElementById("saveStoreBtn")
    .addEventListener(
      "click",
      saveStoreSettings
  );

  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const photoInput = document.getElementById("photoInput");
  
  if (changePhotoBtn) {
    changePhotoBtn.addEventListener("click", () => {
      photoInput.click();
    });
  }
  
  if (photoInput) {
    photoInput.addEventListener("change", handlePhotoUpload);
  }

  // Add event listener to interface theme dropdown for immediate change
  const interfaceThemeSelect = document.getElementById("interfaceTheme");
  if (interfaceThemeSelect) {
    interfaceThemeSelect.addEventListener("change", (e) => {
      const theme = e.target.value;
      localStorage.setItem("adminInterfaceTheme", theme);
      applyInterfaceTheme(theme);
      showToast("Interface theme updated", "success");
    });
  }

  }
);