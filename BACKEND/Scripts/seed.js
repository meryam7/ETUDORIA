import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Grade from '../Model/Grade.js';
import Department from '../Model/Department.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  // Seed Grades
  const grades = [
    { level: 'Bachelor', year: '1st' },
    { level: 'Bachelor', year: '2nd' },
    { level: 'Bachelor', year: '3rd' },
    { level: 'Master', year: '1st', masterType: 'Research' },
    { level: 'Master', year: '1st', masterType: 'Professional' },
    { level: 'Master', year: '2nd', masterType: 'Research' },
    { level: 'Master', year: '2nd', masterType: 'Professional' },
  ];

  await Grade.deleteMany({});
  await Grade.insertMany(grades);
  console.log('Grades seeded');

  // Seed Departments
  const departments = [
    { name: 'Computer Science', gradeLevel: 'Bachelor' },
    { name: 'Computer System Engineering', gradeLevel: 'Bachelor' },
    { name: 'Management Information System', gradeLevel: 'Bachelor' },
    { name: 'Management Science', gradeLevel: 'Bachelor' },
    { name: 'Economic Science', gradeLevel: 'Bachelor' },
    { name: 'Intelligent Information System', gradeLevel: 'Master', masterType: 'Research' },
    { name: 'Finance', gradeLevel: 'Master', masterType: 'Research' },
    { name: 'Data Science (BI Technology)', gradeLevel: 'Master', masterType: 'Professional' },
    { name: 'Distributed Networks and Applications (RAD, MP)', gradeLevel: 'Master', masterType: 'Professional' },
    { name: 'Accounting-Control-Audit', gradeLevel: 'Master', masterType: 'Professional' },
    { name: 'Entrepreneurship and Project Management (PM, EPM)', gradeLevel: 'Master', masterType: 'Professional' },
    { name: 'Economic and Financial Engineering', gradeLevel: 'Master', masterType: 'Professional' },
  ];

  await Department.deleteMany({});
  await Department.insertMany(departments);
  console.log('Departments seeded');

  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  mongoose.connection.close();
});