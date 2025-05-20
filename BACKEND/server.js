import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

const users = [];
const messages = [];
const formations = [];
const news = [];
const notifications = [];
let allowAdminRegistration = true;

// Send email notification
const sendEmail = async (to, title, message) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL || 'your_verified_email@example.com', // Set in .env
    subject: title,
    text: message,
    html: `<p><strong>${title}</strong></p><p>${message}</p>`,
  };
  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.response?.body || error);
  }
};

// Authentication middleware for restricted routes
const requireAuth = (req, res, next) => {
  const { userId } = req.headers; // Simulate auth; replace with JWT in production
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: Please sign in' });
  }
  req.user = user;
  next();
  // In production, use JWT:
  // import jwt from 'jsonwebtoken';
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ message: 'Unauthorized' });
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = decoded;
  //   next();
  // } catch (error) {
  //   res.status(401).json({ message: 'Invalid token' });
  // }
};

// Grade options
app.get('/getGradeOptions', (req, res) => {
  res.json({ data: gradeOptions });
});

// Department options
app.get('/getDepartmentOptions', (req, res) => {
  const { level, masterType } = req.query;
  let filtered = departmentOptions.filter(d => d.level === level);
  if (level === 'Master' && masterType) {
    filtered = filtered.filter(d => d.masterType === masterType);
  }
  res.json({ data: filtered });
});

// Teachers
app.get('/getTeachers', (req, res) => {
  const teachers = users.filter(u => u.role === 'teacher').map(u => ({
    id: u.id,
    username: u.username,
    subject: u.subject,
  }));
  res.json({ data: teachers });
});

// Admin registration status
app.get('/getAdminRegistrationStatus', (req, res) => {
  res.json({ allowAdminRegistration });
});

app.post('/setAdminRegistrationStatus', (req, res) => {
  const { allow } = req.body;
  allowAdminRegistration = allow;
  res.json({ message: 'Admin registration status updated' });
});

// User registration
app.post('/register/:role', (req, res) => {
  const { role } = req.params;
  if (role === 'admin' && !allowAdminRegistration) {
    return res.status(403).json({ message: 'Admin registration disabled' });
  }
  const user = { ...req.body, role, id: uuidv4(), createdAt: new Date() };
  if (role === 'guest') {
    user.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  users.push(user);
  notifications.push({
    id: uuidv4(),
    userId: user.id,
    title: 'Welcome to Etudoria',
    message: `Welcome, ${user.username}! Your ${role} account is created.`,
    timestamp: new Date(),
    read: false,
  });
  // Send welcome email
  if (user.email) {
    sendEmail(user.email, 'Welcome to Etudoria', `Welcome, ${user.username}! Your ${role} account is ready.`);
  }
  res.json({ message: 'Registration successful' });
});

// Send message
app.post('/sendMessage', (req, res) => {
  const { senderId, recipientId, type, message } = req.body;
  const msg = {
    id: uuidv4(),
    senderId,
    recipientId,
    type,
    message,
    timestamp: new Date(),
    replies: [],
  };
  messages.push(msg);
  const sender = users.find(u => u.id === senderId);
  const recipient = users.find(u => u.id === recipientId);
  notifications.push({
    id: uuidv4(),
    userId: senderId,
    title: 'Message Sent',
    message: 'Your message was sent.',
    timestamp: new Date(),
    read: false,
  });
  notifications.push({
    id: uuidv4(),
    userId: recipientId,
    title: 'New Message',
    message: `New message from ${sender.username}.`,
    timestamp: new Date(),
    read: false,
  });
  // Send email to recipient
  if (recipient.email) {
    sendEmail(recipient.email, 'New Message', `You have a new message from ${sender.username}: ${message}`);
  }
  res.json({ message: 'Message sent' });
});

// Reply to message
app.post('/replyMessage', (req, res) => {
  const { messageId, reply, replierId } = req.body;
  const msg = messages.find(m => m.id === messageId);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  const replyObj = { id: uuidv4(), reply, replierId, timestamp: new Date() };
  msg.replies.push(replyObj);
  const replier = users.find(u => u.id === replierId);
  notifications.push({
    id: uuidv4(),
    userId: msg.senderId,
    title: 'New Reply',
    message: `${replier.username} answered you on ${replyObj.timestamp.toISOString()}.`,
    timestamp: new Date(),
    read: false,
  });
  // Send email to original sender
  const sender = users.find(u => u.id === msg.senderId);
  if (sender.email) {
    sendEmail(sender.email, 'New Reply', `${replier.username} replied to your message: ${reply}`);
  }
  res.json({ message: 'Reply sent' });
});

// Get user messages
app.get('/getMessages/:userId', (req, res) => {
  const { userId } = req.params;
  const userMessages = messages.filter(m => m.senderId === userId || m.recipientId === userId);
  res.json({ data: userMessages });
});

// Propose formation
app.post('/proposeFormation', (req, res) => {
  const { name, trainerId } = req.body;
  const currentYear = new Date().getFullYear();
  if (formations.some(f => f.name === name && f.year === currentYear)) {
    return res.status(400).json({ message: 'Formation name already exists this year' });
  }
  const formation = { ...req.body, id: uuidv4(), year: currentYear };
  formations.push(formation);
  const trainer = users.find(u => u.id === trainerId);
  notifications.push({
    id: uuidv4(),
    userId: trainerId,
    title: 'Formation Proposed',
    message: `Formation "${name}" proposal sent.`,
    timestamp: new Date(),
    read: false,
  });
  const admin = users.find(u => u.role === 'admin');
  if (admin) {
    notifications.push({
      id: uuidv4(),
      userId: admin.id,
      title: 'New Formation Proposal',
      message: `New formation "${name}" proposed by ${trainer.username}.`,
      timestamp: new Date(),
      read: false,
    });
    // Send email to admin
    if (admin.email) {
      sendEmail(admin.email, 'New Formation Proposal', `New formation "${name}" proposed by ${trainer.username}.`);
    }
  }
  res.json({ message: 'Formation proposed' });
});

// Post news
app.post('/postNews', (req, res) => {
  const { title, content, adminId } = req.body;
  const newsItem = { id: uuidv4(), title, content, adminId, timestamp: new Date() };
  news.push(newsItem);
  users.forEach(user => {
    if (user.id !== adminId) {
      notifications.push({
        id: uuidv4(),
        userId: user.id,
        title: 'New News',
        message: `New news: ${title}`,
        timestamp: new Date(),
        read: false,
      });
      // Send email to user
      if (user.email) {
        sendEmail(user.email, 'New News', `New news posted: ${title}\n${content}`);
      }
    }
  });
  res.json({ message: 'News posted' });
});

// Get news
app.get('/getNews', (req, res) => {
  res.json({ data: news });
});

// Get notifications
app.get('/getNotifications/:userId', (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  res.json({ data: userNotifications });
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.read = true;
  res.json({ data: notification });
});

// Clear all notifications
app.delete('/clearNotifications/:userId', (req, res) => {
  const { userId } = req.params;
  const indices = notifications
    .map((n, i) => (n.userId === userId ? i : -1))
    .filter(i => i !== -1)
    .reverse();
  indices.forEach(i => notifications.splice(i, 1));
  res.json({ message: 'Notifications cleared' });
});

// Dashboard stats
app.get('/getDashboardStats', (req, res) => {
  const now = new Date();
  const dayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const daily = users.filter(u => new Date(u.createdAt) >= dayStart).length;
  const weekly = users.filter(u => new Date(u.createdAt) >= weekStart).length;
  const monthly = users.filter(u => new Date(u.createdAt) >= monthStart).length;
  
  res.json({ daily, weekly, monthly });
});

// Restricted route example (e.g., courses)
app.get('/courses', requireAuth, (req, res) => {
  res.json({ data: { message: 'Access granted to courses', user: req.user } });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});