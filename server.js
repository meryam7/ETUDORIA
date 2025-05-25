import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('MONGO_URI:', process.env.MONGO_URI || 'Not set');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
console.log('SENDGRID_SENDER_EMAIL:', process.env.SENDGRID_SENDER_EMAIL || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ 
  origin: ["http://deploy-mern-1whq.vercel.app"],
  methods: ["POST", "GET"],
  credentials: true 
}
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for sensitive endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per window
  message: 'Too many login attempts, please try again later.',
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit to 3 requests per window
  message: 'Too many password reset requests, please try again later.',
});

// Configure SendGrid
let emailEnabled = false;
try {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    throw new Error('Invalid or missing SendGrid API key');
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API key set successfully');
  emailEnabled = true;
} catch (error) {
  console.warn('Warning: SendGrid API key is invalid or missing. Email functionality is disabled:', error.message);
}

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage });

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1); // Exit if MongoDB URI is missing
} else {
  // Remove quotes from MONGO_URI if present
  const mongoUri = process.env.MONGO_URI.replace(/^"|"$/g, '');
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1); // Exit on connection failure
    });
}

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  username: { type: String, required: function() { return this.role !== 'guest'; } },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'trainer', 'admin', 'guest'], required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // For guest accounts
  profilePicture: { type: String }, // For student
  gradeLevel: { type: String }, // For student
  gradeYear: { type: String }, // For student
  masterType: { type: String }, // For student
  departmentName: { type: String }, // For student
  subject: { type: String }, // For teacher
  trainingArea: { type: String }, // For trainer
  adminRole: { type: String }, // For admin
  resetCode: { type: String }, // For password reset
  resetCodeExpires: { type: Date }, // For password reset
});
const User = mongoose.model('User', userSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});
const Notification = mongoose.model('Notification', notificationSchema);

// News Schema
const newsSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  adminId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const News = mongoose.model('News', newsSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  replies: [{
    id: { type: String, default: uuidv4 },
    reply: { type: String, required: true },
    replierId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
});
const Message = mongoose.model('Message', messageSchema);

// Formation Schema
const formationSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  trainerId: { type: String, required: true },
  year: { type: Number, required: true },
});
const Formation = mongoose.model('Formation', formationSchema);

// Static Data
const gradeOptions = [
  { level: 'Bachelor', year: 'Year 1' },
  { level: 'Bachelor', year: 'Year 2' },
  { level: 'Bachelor', year: 'Year 3' },
  { level: 'Master', year: 'Year 1' },
  { level: 'Master', year: 'Year 2' },
];

const departmentOptions = [
  { level: 'Bachelor', year: 'Year 1', name: 'Computer Science', displayText: 'CS - Year 1' },
  { level: 'Bachelor', year: 'Year 2', name: 'Mathematics', displayText: 'Math - Year 2' },
  { level: 'Master', masterType: 'Research', name: 'Data Science', displayText: 'Data Science (Research)' },
  { level: 'Master', masterType: 'Professional', name: 'AI', displayText: 'AI (Professional)' },
];

let allowAdminRegistration = true;

// Email Template
const sendEmail = async (to, subject, html) => {
  if (!emailEnabled) {
    console.warn(`Email to ${to} not sent: SendGrid is disabled due to invalid API key`);
    return;
  }
  if (!process.env.SENDGRID_SENDER_EMAIL) {
    console.error('SENDGRID_SENDER_EMAIL is not defined');
    return;
  }
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject,
    html,
  };
  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.response?.body || error);
  }
};

// JWT Authentication Middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ id: decoded.id });
    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Validation Middleware
const validateRegistration = (role) => {
  const base = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ];
  const roleSpecific = {
    student: [
      body('username').notEmpty().withMessage('Username is required'),
      body('gradeLevel').notEmpty().withMessage('Grade level is required'),
      body('gradeYear').notEmpty().withMessage('Grade year is required'),
    ],
    teacher: [
      body('username').notEmpty().withMessage('Username is required'),
      body('subject').notEmpty().withMessage('Subject is required'),
    ],
    trainer: [
      body('username').notEmpty().withMessage('Username is required'),
      body('trainingArea').notEmpty().withMessage('Training area is required'),
    ],
    admin: [
      body('username').notEmpty().withMessage('Username is required'),
      body('adminRole').notEmpty().withMessage('Admin role is required'),
    ],
    guest: [],
  };
  return [...base, ...(roleSpecific[role] || [])];
};

// Routes

// Grade Options
app.get('/getGradeOptions', (req, res) => {
  res.json({ data: gradeOptions });
});

// Department Options
app.get('/getDepartmentOptions', (req, res) => {
  const { level, masterType } = req.query;
  let filtered = departmentOptions.filter(d => d.level === level);
  if (level === 'Master' && masterType) {
    filtered = filtered.filter(d => d.masterType === masterType);
  }
  res.json({ data: filtered });
});

// Teachers
app.get('/getTeachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('id username subject');
    res.json({ data: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Registration Status
app.get('/getAdminRegistrationStatus', (req, res) => {
  res.json({ allowAdminRegistration });
});

app.post('/setAdminRegistrationStatus', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });
  const { allow } = req.body;
  allowAdminRegistration = allow;
  res.json({ message: 'Admin registration status updated' });
});

// User Registration
app.post('/register/:role', upload.single('profilePicture'), validateRegistration(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { role } = req.params;
  if (role === 'admin' && !allowAdminRegistration) {
    return res.status(403).json({ message: 'Admin registration disabled' });
  }

  const { username, email, password, gradeLevel, gradeYear, masterType, departmentName, subject, trainingArea, adminRole } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: uuidv4(),
      username: role !== 'guest' ? username : undefined,
      email,
      password: hashedPassword,
      role,
      profilePicture: role === 'student' ? profilePicture : undefined,
      gradeLevel: role === 'student' ? gradeLevel : undefined,
      gradeYear: role === 'student' ? gradeYear : undefined,
      masterType: role === 'student' ? masterType : undefined,
      departmentName: role === 'student' ? departmentName : undefined,
      subject: role === 'teacher' ? subject : undefined,
      trainingArea: role === 'trainer' ? trainingArea : undefined,
      adminRole: role === 'admin' ? adminRole : undefined,
      expiresAt: role === 'guest' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
    };

    const user = new User(userData);
    await user.save();

    const notification = new Notification({
      id: uuidv4(),
      userId: user.id,
      title: 'Welcome to E.4C',
      message: `Welcome, ${user.username || 'Guest'}! Your ${role} account is created.`,
      timestamp: new Date(),
    });
    await notification.save();

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to E.4C',
      `
        <h2>Welcome to E.4C!</h2>
        <p>Hello ${user.username || 'Guest'},</p>
        <p>Your ${role} account has been successfully created.</p>
        <p>Start exploring now: <a href="${process.env.FRONTEND_URL}">E.4C</a></p>
      `
    );

    res.status(201).json({ message: 'Registration successful', userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/auth/login', loginLimiter, [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['student', 'teacher', 'trainer', 'admin', 'guest']).withMessage('Invalid user type'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, userType } = req.body;

  try {
    const user = await User.findOne({ email, role: userType });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
app.post('/forgot-password', forgotPasswordLimiter, [
  body('email').isEmail().withMessage('Invalid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = code;
    user.resetCodeExpires = expires;
    await user.save();

    await sendEmail(
      email,
      'Password Reset Code',
      `
        <h2>E.4C Password Reset</h2>
        <p>Your 4-digit code is: <strong>${code}</strong></p>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      `
    );

    res.json({ message: 'Reset code sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Code
app.post('/verify-code', [
  body('email').isEmail().withMessage('Invalid email'),
  body('code').isLength({ min: 4, max: 4 }).withMessage('Code must be 4 digits'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email, resetCode: code });
    if (!user) return res.status(400).json({ message: 'Invalid code' });
    if (user.resetCodeExpires < new Date()) {
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();
      return res.status(400).json({ message: 'Code expired' });
    }

    res.json({ message: 'Code verified' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
app.post('/reset-password', [
  body('email').isEmail().withMessage('Invalid email'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetCode) return res.status(400).json({ message: 'No reset code found' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    await sendEmail(
      email,
      'Password Reset Successful',
      `
        <h2>E.4C Password Reset</h2>
        <p>Your password has been successfully reset.</p>
        <p>Log in now: <a href="${process.env.FRONTEND_URL}/login">Login</a></p>
      `
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Message
app.post('/sendMessage', requireAuth, [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('type').notEmpty().withMessage('Message type is required'),
  body('message').notEmpty().withMessage('Message is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { recipientId, type, message } = req.body;
  const senderId = req.user.id;

  try {
    const recipient = await User.findOne({ id: recipientId });
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const msg = new Message({
      id: uuidv4(),
      senderId,
      recipientId,
      type,
      message,
      timestamp: new Date(),
    });
    await msg.save();

    const sender = req.user;
    await Promise.all([
      new Notification({
        id: uuidv4(),
        userId: senderId,
        title: 'Message Sent',
        message: 'Your message was sent.',
        timestamp: new Date(),
      }).save(),
      new Notification({
        id: uuidv4(),
        userId: recipientId,
        title: 'New Message',
        message: `New message from ${sender.username || 'Guest'}.`,
        timestamp: new Date(),
      }).save(),
      sendEmail(
        recipient.email,
        'New Message',
        `
          <h2>New Message on E.4C</h2>
          <p>You have a new message from ${sender.username || 'Guest'}:</p>
          <p>${message}</p>
          <p>Reply now: <a href="${process.env.FRONTEND_URL}/messages">Messages</a></p>
        `
      ),
    ]);

    res.json({ message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to Message
app.post('/replyMessage', requireAuth, [
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('reply').notEmpty().withMessage('Reply is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { messageId, reply } = req.body;
  const replierId = req.user.id;

  try {
    const msg = await Message.findOne({ id: messageId });
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const replyObj = { id: uuidv4(), reply, replierId, timestamp: new Date() };
    msg.replies.push(replyObj);
    await msg.save();

    const replier = req.user;
    const sender = await User.findOne({ id: msg.senderId });
    await Promise.all([
      new Notification({
        id: uuidv4(),
        userId: msg.senderId,
        title: 'New Reply',
        message: `${replier.username || 'Guest'} replied to your message.`,
        timestamp: new Date(),
      }).save(),
      sendEmail(
        sender.email,
        'New Reply',
        `
          <h2>New Reply on E.4C</h2>
          <p>${replier.username || 'Guest'} replied to your message:</p>
          <p>${reply}</p>
          <p>View now: <a href="${process.env.FRONTEND_URL}/messages">Messages</a></p>
        `
      ),
    ]);

    res.json({ message: 'Reply sent' });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Messages
app.get('/getMessages/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

  try {
    const userMessages = await Message.find({ $or: [{ senderId: userId }, { recipientId: userId }] });
    res.json({ data: userMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Propose Formation
app.post('/proposeFormation', requireAuth, [
  body('name').notEmpty().withMessage('Formation name is required'),
  body('trainerId').notEmpty().withMessage('Trainer ID is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, trainerId } = req.body;
  if (req.user.id !== trainerId || req.user.role !== 'trainer') {
    return res.status(403).json({ message: 'Forbidden: Trainer only' });
  }

  try {
    const currentYear = new Date().getFullYear();
    const existing = await Formation.findOne({ name, year: currentYear });
    if (existing) return res.status(400).json({ message: 'Formation name already exists this year' });

    const formation = new Formation({ id: uuidv4(), name, trainerId, year: currentYear });
    await formation.save();

    const trainer = req.user;
    const admin = await User.findOne({ role: 'admin' });
    await Promise.all([
      new Notification({
        id: uuidv4(),
        userId: trainerId,
        title: 'Formation Proposed',
        message: `Formation "${name}" proposal sent.`,
        timestamp: new Date(),
      }).save(),
      admin && new Notification({
        id: uuidv4(),
        userId: admin.id,
        title: 'New Formation Proposal',
        message: `New formation "${name}" proposed by ${trainer.username}.`,
        timestamp: new Date(),
      }).save(),
      admin && sendEmail(
        admin.email,
        'New Formation Proposal',
        `
          <h2>New Formation Proposal on E.4C</h2>
          <p>New formation "${name}" proposed by ${trainer.username}.</p>
          <p>Review now: <a href="${process.env.FRONTEND_URL}/admin/formations">Formations</a></p>
        `
      ),
    ]);

    res.json({ message: 'Formation proposed' });
  } catch (error) {
    console.error('Propose formation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post News
app.post('/postNews', requireAuth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });

  const { title, content } = req.body;
  const adminId = req.user.id;

  try {
    const newsItem = new News({ id: uuidv4(), title, content, adminId, timestamp: new Date() });
    await newsItem.save();

    const users = await User.find({ id: { $ne: adminId } });
    const notificationsPromises = users.map(user => new Notification({
      id: uuidv4(),
      userId: user.id,
      title: 'New News',
      message: `New news: ${title}`,
      timestamp: new Date(),
    }).save());
    const emailPromises = users.map(user => sendEmail(
      user.email,
      'New News',
      `
        <h2>New News on E.4C</h2>
        <p>${title}</p>
        <p>${content}</p>
        <p>Read more: <a href="${process.env.FRONTEND_URL}/news">News</a></p>
      `
    ));

    await Promise.all([...notificationsPromises, ...emailPromises]);
    res.json({ message: 'News posted' });
  } catch (error) {
    console.error('Post news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get News
app.get('/getNews', async (req, res) => {
  try {
    const news = await News.find().sort({ timestamp: -1 });
    res.json({ data: news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Notifications
app.get('/getNotifications/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

  try {
    const userNotifications = await Notification.find({ userId }).sort({ timestamp: -1 });
    res.json({ data: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark Notification as Read
app.put('/notifications/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({ id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    notification.read = true;
    await notification.save();
    res.json({ data: notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear Notifications
app.delete('/clearNotifications/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

  try {
    await Notification.deleteMany({ userId });
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard Stats
app.get('/getDashboardStats', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin only' });

  try {
    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [daily, weekly, monthly] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: dayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    res.json({ daily, weekly, monthly });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Courses (Example Restricted Route)
app.get('/courses', requireAuth, (req, res) => {
  res.json({ data: { message: 'Access granted to courses', user: req.user } });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
