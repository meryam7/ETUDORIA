import User from '../Model/User.model.js';
import Grade from '../Model/Grade.js';
import Department from '../Model/Department.js';

export const registerStudent = async (req, res) => {
  try {
    const { username, email, password, gradeLevel, gradeYear, masterType, departmentName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists',
      });
    }

    // Find or create grade
    const gradeQuery = { level: gradeLevel, year: gradeYear };
    if (gradeLevel === 'Master' && masterType) {
      gradeQuery.masterType = masterType;
    }
    let grade = await Grade.findOne(gradeQuery);
    if (!grade) {
      grade = await Grade.create(gradeQuery);
    }

    // Find or create department
    const deptQuery = { name: departmentName, level: gradeLevel };
    if (gradeLevel === 'Master' && masterType) {
      deptQuery.masterType = masterType;
    }
    let department = await Department.findOne(deptQuery);
    if (!department) {
      department = await Department.create(deptQuery);
    }

    // Create user
    const user = new User({
      username,
      email,
      password, // Hashed by User.model.js pre-save hook
      role: 'student',
      grade: grade._id,
      department: department._id,
    });
    await user.save();

    // Remove sensitive data from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        student: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          grade: gradeQuery,
          department: deptQuery,
        },
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export const getGradeOptions = async (req, res) => {
  try {
    const gradeOptions = [
      { level: 'Bachelor', year: '1' },
      { level: 'Bachelor', year: '2' },
      { level: 'Bachelor', year: '3' },
      { level: 'Master', year: '1', masterType: 'Research' },
      { level: 'Master', year: '1', masterType: 'Professional' },
      { level: 'Master', year: '2', masterType: 'Research' },
      { level: 'Master', year: '2', masterType: 'Professional' },
    ];
    res.status(200).json({
      status: 'success',
      data: gradeOptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Failed to fetch grade options',
    });
  }
};

export const getDepartmentOptions = async (req, res) => {
  try {
    const { level, masterType } = req.query;
    const departmentOptions = [
      { name: 'CS', displayText: 'Computer Science', level: 'Bachelor' },
      { name: 'ENG', displayText: 'Engineering', level: 'Bachelor' },
      { name: 'MCS', displayText: 'Master CS (Research)', level: 'Master', masterType: 'Research' },
      { name: 'MPRO', displayText: 'Master Professional', level: 'Master', masterType: 'Professional' },
    ].filter((dept) => dept.level === level && (!masterType || dept.masterType === masterType));
    res.status(200).json({
      status: 'success',
      data: departmentOptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Failed to fetch department options',
    });
  }
};

// Placeholder functions for future implementation
export const registerTeacher = async (req, res) => {
  res.status(501).json({
    status: 'fail',
    message: 'Teacher registration not implemented',
  });
};

export const registerAdmin = async (req, res) => {
  res.status(501).json({
    status: 'fail',
    message: 'Admin registration not implemented',
  });
};