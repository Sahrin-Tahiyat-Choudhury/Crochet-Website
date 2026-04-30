const mongoose = require('mongoose');

const pageSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: '',
      trim: true
    },
    title: {
      type: String,
      default: '',
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const pageContentSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      enum: ['homepage', 'about', 'faq', 'policies'],
      required: true,
      unique: true
    },
    title: {
      type: String,
      default: '',
      trim: true
    },
    heroTitle: {
      type: String,
      default: '',
      trim: true
    },
    heroSubtitle: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    sections: {
      type: [pageSectionSchema],
      default: []
    },
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
      }
    ],
    featuredCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
      }
    ],
    homepageReviews: [
  {
    image: String,
    title: String,
    subtitle: String,
    order: Number,
    isActive: Boolean
  }
],
    contactEmail: {
      type: String,
      default: '',
      trim: true
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    contactAddress: {
      type: String,
      default: '',
      trim: true
    },
    faqItems: {
      type: [faqItemSchema],
      default: []
    },
    policies: {
      returnRefundPolicy: {
        type: String,
        default: '',
        trim: true
      },
      shippingPolicy: {
        type: String,
        default: '',
        trim: true
      },
      privacyPolicy: {
        type: String,
        default: '',
        trim: true
      },
      termsOfService: {
        type: String,
        default: '',
        trim: true
      }
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
);

const pageContentModel = mongoose.model('pageContent', pageContentSchema);

module.exports = pageContentModel;
