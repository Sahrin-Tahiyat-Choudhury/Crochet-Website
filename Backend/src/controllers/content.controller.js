const bannerModel = require('../models/banner.model');
const pageContentModel = require('../models/pageContent.model');
const {uploadFile} = require('../services/storage.services')

async function getHomepage(req, res) {
  try {
    const homepage = await pageContentModel
      .findOne({ pageType: 'homepage' })
      .populate('featuredProducts', 'name uri price isFeatured isHidden sold stockQuantity')
      .populate('featuredCategories', 'name isHidden order');

    const banners = await bannerModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    res.json({
      banners,
      homepage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homepage content', error: error.message });
  }
}

async function updateHomepage(req, res) {
  try {
    const homepageReviews = req.body;
    let homepage = await pageContentModel.findOne({ pageType: 'homepage' });

    if (!homepage) {
      homepage = await pageContentModel.create({
        ...req.body,
        pageType: 'homepage',
        admin: req.user.id
      });
    } else {
      homepage = await pageContentModel.findOneAndUpdate(
        { pageType: 'homepage' },
        {
          ...req.body,
          pageType: 'homepage',
          admin: req.user.id
        },
        { new: true}
      );
    }

    res.json({ message: 'Homepage updated successfully', homepage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating homepage', error: error.message });
  }
}

async function getBanners(req, res) {
  try {
    const query = req.user?.role === 'admin' ? {} : { isActive: true };
    const banners = await bannerModel.find(query).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
}

async function createBanner(req, res) {
  try {
    const { title, subtitle, link, ctaText, order, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a banner image' });
    }

    const uploaded = await uploadFile(req.file.buffer);

    const banner = await bannerModel.create({
      title,
      subtitle,
      image: uploaded.url,
      link,
      ctaText,
      order,
      isActive,
      admin: req.user.id
    });

    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
}

async function updateBanner(req, res) {
  try {
    const banner = await bannerModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        admin: req.user.id
      },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner updated successfully', banner });
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
}

async function deleteBanner(req, res) {
  try {
    const banner = await bannerModel.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
}

async function getAbout(req, res) {
  try {
    const about = await pageContentModel.findOne({ pageType: 'about' });
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching about page', error: error.message });
  }
}

async function updateAbout(req, res) {
  try {
    let about = await pageContentModel.findOne({ pageType: 'about' });

    if (!about) {
      about = await pageContentModel.create({
        ...req.body,
        pageType: 'about',
        admin: req.user.id
      });
    } else {
      about = await pageContentModel.findOneAndUpdate(
        { pageType: 'about' },
        {
          ...req.body,
          pageType: 'about',
          admin: req.user.id
        },
        { new: true }
      );
    }

    res.json({ message: 'About page updated successfully', about });
  } catch (error) {
    res.status(500).json({ message: 'Error updating about page', error: error.message });
  }
}

async function getFaq(req, res) {
  try {
    const faq = await pageContentModel.findOne({ pageType: 'faq' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ', error: error.message });
  }
}

async function updateFaq(req, res) {
  try {
    let faq = await pageContentModel.findOne({ pageType: 'faq' });

    if (!faq) {
      faq = await pageContentModel.create({
        ...req.body,
        pageType: 'faq',
        admin: req.user.id
      });
    } else {
      faq = await pageContentModel.findOneAndUpdate(
        { pageType: 'faq' },
        {
          ...req.body,
          pageType: 'faq',
          admin: req.user.id
        },
        { new: true }
      );
    }

    res.json({ message: 'FAQ updated successfully', faq });
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
}

async function getPolicies(req, res) {
  try {
    const policies = await pageContentModel.findOne({ pageType: 'policies' });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
}

async function updatePolicies(req, res) {
  try {
    let policies = await pageContentModel.findOne({ pageType: 'policies' });

    if (!policies) {
      policies = await pageContentModel.create({
        ...req.body,
        pageType: 'policies',
        admin: req.user.id
      });
    } else {
      policies = await pageContentModel.findOneAndUpdate(
        { pageType: 'policies' },
        {
          ...req.body,
          pageType: 'policies',
          admin: req.user.id
        },
        { new: true }
      );
    }

    res.json({ message: 'Policies updated successfully', policies });
  } catch (error) {
    res.status(500).json({ message: 'Error updating policies', error: error.message });
  }
}



module.exports = {
  getHomepage,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAbout,
  updateAbout,
  getFaq,
  updateFaq,
  getPolicies,
  updatePolicies,
  updateHomepage
};
