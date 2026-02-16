const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, username) => {
    return jwt.sign({ id, role, username }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    try {
        const user = await User.findOne({ username });

        if (user) {
            console.log(`User found: ${user.username}`);
            const isMatch = await user.matchPassword(password);
            console.log(`Password match result: ${isMatch}`);

            if (isMatch) {
                res.json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id, user.role, user.username),
                });
                return;
            }
        } else {
            console.log('User not found');
        }

        res.status(401).json({ msg: 'Invalid username or password' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Register a new user (Internal/Seed use mostly)
// @route   POST /api/auth/register
// @access  Public (for now, or Admin only)
const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = await User.create({
            username,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role, user.username),
            });
        } else {
            res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = { authUser, registerUser };
