import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: pass
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("Error connecting to Gmail:", error);
  } else {
    console.log("Success! Gmail connected properly.");
  }
});
