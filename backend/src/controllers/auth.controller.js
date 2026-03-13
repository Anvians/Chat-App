import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET } from '../config/env.js';

dotenv.config();

export const registerUser = async (req, res) => {
  const { name, phone_number, password } = req.body;

  if (!name || !phone_number || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existUser = await User.findOne({ phone_number });
    if (existUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phone_number,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        phone_number: newUser.phone_number,
        dp: newUser.dp || "",
        status: newUser.status || "",
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { phone_number, password } = req.body;

  try {
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // localStorage.getItem("user") has the full shape the frontend needs
    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        phone_number: user.phone_number,
        dp: user.dp || "",
        status: user.status || "",
      },
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};