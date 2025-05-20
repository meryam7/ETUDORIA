import express from 'express';
import { registerStudent, getGradeOptions, getDepartmentOptions } from '../Controller/User.controller.js';
import { validateStudentRegistration } from '../Middleware/Validation.js';
import { login, forgotPassword } from '../Controller/authcontroller.js';

const route = express.Router();

// Student registration with validation middleware
route.post('/register/student', validateStudentRegistration, registerStudent);

// Placeholder routes (to be implemented)
route.post('/register/teacher', (req, res) => res.status(501).json({ message: 'Teacher registration not implemented' }));
route.post('/register/admin', (req, res) => res.status(501).json({ message: 'Admin registration not implemented' }));
route.post('/register/trainer', (req, res) => res.status(501).json({ message: 'Trainer registration not implemented' }));
route.post('/register/guest', (req, res) => res.status(501).json({ message: 'Guest registration not implemented' }));

// Authentication routes
route.post('/login', login);
route.post('/forgot-password', forgotPassword);

// Data fetching routes
route.get('/getGradeOptions', getGradeOptions);
route.get('/getDepartmentOptions', getDepartmentOptions);

export default route;