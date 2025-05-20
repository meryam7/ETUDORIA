import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['Bachelor', 'Master'],
  },
  year: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd'], // Allow 3rd only for Bachelor
    validate: {
      validator: function (value) {
        if (this.level === 'Master' && value === '3rd') {
          return false;
        }
        return true;
      },
      message: '3rd year is only valid for Bachelor level',
    },
  },
  masterType: {
    type: String,
    enum: ['Research', 'Professional', null],
    required: function () {
      return this.level === 'Master';
    },
    default: null,
  },
});

export default mongoose.model('Grade', gradeSchema);