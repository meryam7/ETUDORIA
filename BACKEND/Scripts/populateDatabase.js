import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Grade from '../models/Grade.model.js';
import Department from '../models/Department.model.js';

dotenv.config();

async function populateDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Grade.deleteMany({});
    await Department.deleteMany({});

    const grades = [
      { level: 'Bachelor', year: '1st', masterType: null },
      { level: 'Bachelor', year: '2nd', masterType: null },
      { level: 'Bachelor', year: '3rd', masterType: null },
      { level: 'Master', year: '1st', masterType: 'Research' },
      { level: 'Master', year: '1st', masterType: 'Professional' },
      { level: 'Master', year: '2nd', masterType: 'Research' },
      { level: 'Master', year: '2nd', masterType: 'Professional' },
    ];

    const departments = [
      { name: 'Computer Science', gradeLevel: 'Bachelor', masterType: null },
      { name: 'Mathematics', gradeLevel: 'Bachelor', masterType: null },
      { name: 'Data Science', gradeLevel: 'Master', masterType: 'Research' },
      { name: 'AI', gradeLevel: 'Master', masterType: 'Professional' },
    ];

    await Grade.insertMany(grades);
    await Department.insertMany(departments);
    console.log('Populated Grades and Departments');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

populateDatabase();