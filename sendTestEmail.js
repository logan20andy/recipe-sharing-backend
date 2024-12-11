const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'destinatario@example.com', // Reemplaza con un correo de prueba
    subject: 'Test Email',
    text: 'This is a test email from nodemailer.',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('Error sending test email:', error);
    } else {
        console.log('Test email sent:', info.response);
    }
});
