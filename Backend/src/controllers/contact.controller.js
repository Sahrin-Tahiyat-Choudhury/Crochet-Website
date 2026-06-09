const ContactMessage = require('../models/contactMessage.model');
const Settings = require('../models/settings.model');
const { sendEmail } = require('../utils/sendEmail');

async function createContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    const settings = await Settings.findOne();
    const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL || settings?.contactEmail || process.env.EMAIL_USER;
    if (notificationEmail) {
      try {
        await sendEmail({
          to: notificationEmail,
          subject: `New contact request: ${subject}`,
          text: `You have a new message from ${name} <${email}>:\n\n${message}`,
        });
      } catch (emailError) {
        console.warn('Contact message saved but failed to send notification email:', emailError.message);
      }
    }

    return res.status(201).json({ message: 'Your message has been received.', contactMessage });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit message', error: error.message });
  }
}

async function getContactMessages(req, res) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view contact messages' });
    }

    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load contact messages', error: error.message });
  }
}

module.exports = { createContactMessage, getContactMessages };
