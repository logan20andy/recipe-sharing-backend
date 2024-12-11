const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configurar nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Función para enviar el correo de confirmación con botones
function sendConfirmationEmail(user) {
    const loginLink = `http://localhost:5173/login`;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: 'Account Created Successfully',
        text: `Hello ${user.name},\n\nYour account has been created successfully. You can log in by clicking the button below:\n\n${loginLink}\n\nThank you!`,
        html: `
            <p>Hello ${user.name},</p>
            <p>Your account has been created successfully. You can log in by clicking the button below:</p>
            <a href="${loginLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #008CBA; text-decoration: none; border-radius: 5px;">Log In</a>
            <p>Thank you!</p>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Confirmation email sent:', info.response);
        }
    });
}

// Registro de usuario
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        // Verificar si el correo electrónico ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, isActive: true }); // Activar la cuenta automáticamente
        await user.save();

        // Enviar el correo de confirmación
        sendConfirmationEmail(user);

        res.status(201).json({ message: 'User created and account activated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inicio de sesión de usuario
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isActive) return res.status(403).json({ message: 'Account not activated' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
