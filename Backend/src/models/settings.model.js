const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({

  // Store
  storeName: {
    type: String,
    default: "The Yarn Journey"
  },

  tagline: {
    type: String,
    default: ""
  },

  description: {
    type: String,
    default: ""
  },

  contactEmail: {
    type: String,
    default: ""
  },

  contactPhone: {
    type: String,
    default: ""
  },

  address: {
    type: String,
    default: ""
  },

  currency: {
    type: String,
    default: "INR"
  },

  // Notifications

  notifications: {

    newOrder: {
      type: Boolean,
      default: true
    },

    orderStatusUpdated: {
      type: Boolean,
      default: true
    },

    lowStockAlert: {
      type: Boolean,
      default: true
    },

    newCustomer: {
      type: Boolean,
      default: false
    },

    promoCodeUsed: {
      type: Boolean,
      default: false
    },

    dailySummary: {
      type: Boolean,
      default: true
    },

    weeklyReport: {
      type: Boolean,
      default: true
    },

    productReview: {
      type: Boolean,
      default: false
    }
  },

  // Payments

  payments: {

    upiEnabled: {
      type: Boolean,
      default: true
    },

    codEnabled: {
      type: Boolean,
      default: true
    },

    bankTransferEnabled: {
      type: Boolean,
      default: true
    },

    cardEnabled: {
      type: Boolean,
      default: false
    },

    upiId: {
      type: String,
      default: ""
    },

    bankAccountName: {
      type: String,
      default: ""
    },

    ifscCode: {
      type: String,
      default: ""
    }
  },

  // Shipping

  shipping: {

    fee: {
      type: Number,
      default: 60
    },

    freeShippingAbove: {
      type: Number,
      default: 999
    },

    deliveryTime: {
      type: String,
      default: "3-7 business days"
    },

    zone: {
      type: String,
      default: "All India"
    },

    codAvailable: {
      type: Boolean,
      default: true
    }
  },

  // Appearance

  appearance: {

    themeColor: {
      type: String,
      default: "#e8916a"
    },

    interfaceTheme: {
      type: String,
      default: "light"
    },

    dateFormat: {
      type: String,
      default: "DD MMM YYYY"
    },

    compactSidebar: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true
});


module.exports = mongoose.model("Settings", settingsSchema);
