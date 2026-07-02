import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Contact Message Schema (save to DB)
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  receivedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Basic Route
app.get('/', (req, res) => {
  res.send('Portfolio Backend is running ✅');
});

// ── WhatsApp Notification via CallMeBot ──────────────────────────────────────
const sendWhatsApp = (name, email, message) => {
  const phone = process.env.WHATSAPP_PHONE;    // e.g. 923001234567
  const apiKey = process.env.WHATSAPP_APIKEY;  // from callmebot.com
  if (!phone || !apiKey) return;

  const text = encodeURIComponent(
    `📩 New Portfolio Message!\n\n👤 Name: ${name}\n📧 Email: ${email}\n\n💬 Message:\n${message}`
  );
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`;

  https.get(url, (res) => {
    console.log('WhatsApp notification sent, status:', res.statusCode);
  }).on('error', (err) => {
    console.error('WhatsApp notification error:', err.message);
  });
};

// ── Beautiful HTML Email Template ────────────────────────────────────────────
const buildEmailHTML = (name, email, message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Portfolio Message</title>
</head>
<body style="margin:0;padding:0;background:#0d0b14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b14;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1528 0%,#12101e 100%);border-radius:20px;border:1px solid rgba(255,126,179,0.2);overflow:hidden;max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#ff7eb3,#9d00ff,#00ffd5);padding:3px 0;"></td>
          </tr>
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="font-size:48px;margin-bottom:10px;">✨</div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:0.05em;">New Message Received!</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:8px 0 0;">Someone reached out from your portfolio website</p>
            </td>
          </tr>

          <!-- Sender Info Cards -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 8px 16px 0;" width="50%">
                    <div style="background:rgba(255,126,179,0.08);border:1px solid rgba(255,126,179,0.2);border-left:4px solid #ff7eb3;border-radius:12px;padding:16px;">
                      <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">From</p>
                      <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0;">👤 ${name}</p>
                    </div>
                  </td>
                  <td style="padding:0 0 16px 8px;" width="50%">
                    <div style="background:rgba(0,255,213,0.08);border:1px solid rgba(0,255,213,0.2);border-left:4px solid #00ffd5;border-radius:12px;padding:16px;">
                      <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Email</p>
                      <p style="color:#ffffff;font-size:13px;font-weight:600;margin:0;word-break:break-all;">📧 ${email}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding:0 40px 30px;">
              <div style="background:rgba(157,0,255,0.08);border:1px solid rgba(157,0,255,0.2);border-left:4px solid #9d00ff;border-radius:12px;padding:24px;">
                <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">💬 Message</p>
                <p style="color:#e0e0e0;font-size:15px;font-weight:400;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding:0 40px 30px;text-align:center;">
              <a href="mailto:${email}?subject=Re: Your message on Amna's Portfolio" 
                 style="display:inline-block;background:linear-gradient(90deg,#ff7eb3,#9d00ff);color:#0d0b14;font-weight:800;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
                Reply Now ✉️
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(90deg,#ff7eb3,#9d00ff,#00ffd5);padding:3px 0;"></td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">This email was auto-sent from <strong style="color:rgba(255,255,255,0.5);">Amna Muzammil's Portfolio</strong> contact form.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Contact Route ─────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  try {
    // 1️⃣ Save to MongoDB
    const contactEntry = new Contact({ name, email, message });
    await contactEntry.save();

    // 2️⃣ Send HTML Email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''
      }
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `✨ New Message from ${name} — Portfolio`,
      html: buildEmailHTML(name, email, message),
      text: `New Portfolio Message\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);

    // 3️⃣ Send WhatsApp notification (non-blocking)
    sendWhatsApp(name, email, message);

    res.status(200).json({ success: true, message: 'Message received! You will hear back soon.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
