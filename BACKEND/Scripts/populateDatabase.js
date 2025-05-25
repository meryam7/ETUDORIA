import mongoose from 'mongoose';
import Grade from '../models/Grade.model.js';
import Department from '../models/Department.model.js';

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Grade.deleteMany({});
    await Department.deleteMany({});
    console.log('Cleared existing Grade and Department collections');

    // Populate Grades
    const grades = [
      { level: 'Bachelor', year: '1st' },
      { level: 'Bachelor', year: '2nd' },
      { level: 'Bachelor', year: '3rd' },
      { level: 'Master', year: '1st', masterType: 'Research' },
      { level: 'Master', year: '1st', masterType: 'Professional' },
      { level: 'Master', year: '2nd', masterType: 'Research' },
      { level: 'Master', year: '2nd', masterType: 'Professional' },
    ];

    const insertedGrades = await Grade.insertMany(grades);
    console.log('Inserted Grades:', insertedGrades);

    // Populate Departments
    const departments = [
      { name: 'Computer Science', gradeLevel: 'Bachelor' },
      { name: 'Computer System Engineering', gradeLevel: 'Bachelor' },
      { name: 'Management Information System', gradeLevel: 'Bachelor' },
      { name: 'Management Science', gradeLevel: 'Bachelor' },
      { name: 'Economic Science', gradeLevel: 'Bachelor' },
      { name: 'Finance', gradeLevel: 'Bachelor' },
      { name: 'Accounting-Control-Audit', gradeLevel: 'Bachelor' },
      { name: 'Intelligent Information System', gradeLevel: 'Master', masterType: 'Research' },
      { name: 'Data Science (BI Technology)', gradeLevel: 'Master', masterType: 'Professional' },
      { name: 'Distributed Networks and Applications (RAD, MP)', gradeLevel: 'Master', masterType: 'Research' },
      { name: 'Entrepreneurship and Project Management (PM, EPM)', gradeLevel: 'Master', masterType: 'Professional' },
      { name: 'Economic and Financial Engineering', gradeLevel: 'Master', masterType: 'Professional' },
    ];

    const insertedDepartments = await Department.insertMany(departments);
    console.log('Inserted Departments:', insertedDepartments);

    console.log('Database population completed');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

populateDatabase();