import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Computer Science',
      'Computer System Engineering',
      'Management Information System',
      'Management Science',
      'Economic Science',
      'Intelligent Information System',
      'Finance',
      'Data Science (BI Technology)',
      'Distributed Networks and Applications (RAD, MP)',
      'Accounting-Control-Audit',
      'Entrepreneurship and Project Management (PM, EPM)',
      'Economic and Financial Engineering',
    ],
  },
  gradeLevel: {
    type: String,
    required: true,
    enum: ['Bachelor', 'Master'],
  },
  masterType: {
    type: String,
    enum: ['Research', 'Professional', null],
    required: function () {
      return this.gradeLevel === 'Master';
    },
    default: null,
  },
});

export default mongoose.model('Department', departmentSchema);