const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      default: '',
      trim: true
    },
    ctaText: {
      type: String,
      default: '',
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
);

const bannerModel = mongoose.model('banner', bannerSchema);

module.exports = bannerModel;
