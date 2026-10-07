import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, photoURL } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      displayName: name,
      email,
      password: hashedPassword,
      photoURL
    });

    const savedUser = await newUser.save();

    // Create token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: savedUser._id, name: savedUser.displayName, email: savedUser.email } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.displayName, email: user.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Send back formatted user mapping Mongoose _id to uid for frontend compatibility
    const formattedUser = { ...user.toObject(), uid: user._id.toString() };
    res.json(formattedUser);
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
