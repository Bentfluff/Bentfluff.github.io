const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors({ origin: 'https://www.slab-stash.com' })); // Allow requests from your GitHub Pages site

// Configure Nodemailer for PrivateEmail with regular password (no 2FA)
const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587, // Use 465 for SSL if needed
    secure: false, // true for port 465, false for port 587
    auth: {
        user: 'customerservice@slab-stash.com', // Your PrivateEmail address
        pass: process.env.EMAIL_PASS // Your regular PrivateEmail password (post-2FA removal)
    }
});

// Endpoint to handle contact form submissions
app.post('/send-contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const mailOptions = {
        from: email,
        to: 'customerservice@slab-stash.com', // Recipient email
        subject: `Contact Form Submission from ${name}`,
        text: `${message}\n\nFrom: ${email}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Error sending message. Please try again later.' });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Thank you! Your message has been sent to customerservice@slab-stash.com.' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});