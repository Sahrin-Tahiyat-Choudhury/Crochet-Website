const Settings =
  require("../models/settings.model");

async function getSettings(req,res) {

  let settings =
    await Settings.findOne();

  if (!settings) {

    settings =
      await Settings.create({});
  }

  res.json(settings);
}

async function updateSettings(req,res) {

  const settings =
    await Settings.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        upsert: true
      }
    );

  res.json({
    message:
      "Settings updated",
    settings
  });
}

module.exports = {
  getSettings,
  updateSettings
};