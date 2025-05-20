import mongoose from 'mongoose';
import User from './User.model.js';

const studentSchema = new mongoose.Schema({
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  studentId: {
    type: String,
    unique: true,
    default: function () {
      return 'STU' + Math.floor(1000 + Math.random() * 9000);
    },
  },
});

const Student = User.discriminator('student', studentSchema);

export default Student;