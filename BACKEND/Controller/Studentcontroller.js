import Student from '../Model/Student.js';
import Grade from '../Model/Grade.js';
import Department from '../Model/Department.js';

exports.registerStudent = async (req, res) => {
  try {
    const { username, email, password, gradeLevel, gradeYear, masterType, departmentName } = req.body;

    // Validate input
    if (!username || !email || !password || !gradeLevel || !gradeYear || !departmentName) {
      return res.status(400).json({
        status: 'fail',
        message: 'All required fields must be provided',
      });
    }

    // Validate gradeLevel
    if (!['Bachelor', 'Master'].includes(gradeLevel)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid grade level. Must be Bachelor or Master',
      });
    }

    // Validate gradeYear
    const validYears = gradeLevel === 'Bachelor' ? ['1st', '2nd', '3rd'] : ['1st', '2nd'];
    if (!validYears.includes(gradeYear)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid year for ${gradeLevel}. Must be one of ${validYears.join(', ')}`,
      });
    }

    // Validate masterType for Master level
    let validatedMasterType = null;
    if (gradeLevel === 'Master') {
      if (!masterType || !['Research', 'Professional'].includes(masterType)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Master type must be Research or Professional',
        });
      }
      validatedMasterType = masterType;
    }

    // Validate departmentName
    const validDepartments = {
      Bachelor: [
        'Computer Science',
        'Computer System Engineering',
        'Management Information System',
        'Management Science',
        'Economic Science',
      ],
      Master: {
        Research: ['Intelligent Information System', 'Finance'],
        Professional: [
          'Data Science (BI Technology)',
          'Distributed Networks and Applications (RAD, MP)',
          'Accounting-Control-Audit',
          'Entrepreneurship and Project Management (PM, EPM)',
          'Economic and Financial Engineering',
        ],
      },
    };

    let isValidDepartment = false;
    if (gradeLevel === 'Bachelor') {
      isValidDepartment = validDepartments.Bachelor.includes(departmentName);
    } else if (gradeLevel === 'Master') {
      isValidDepartment = validDepartments.Master[masterType].includes(departmentName);
    }

    if (!isValidDepartment) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid department for ${gradeLevel}${masterType ? ` (${masterType})` : ''}. Must be one of ${
          gradeLevel === 'Bachelor'
            ? validDepartments.Bachelor.join(', ')
            : validDepartments.Master[masterType].join(', ')
        }`,
      });
    }

    // Find or create grade
    const gradeQuery = { level: gradeLevel, year: gradeYear };
    if (gradeLevel === 'Master') gradeQuery.masterType = validatedMasterType;

    let grade = await Grade.findOne(gradeQuery);
    if (!grade) {
      grade = await Grade.create(gradeQuery);
    }

    // Find or create department
    const deptQuery = { name: departmentName, gradeLevel };
    if (gradeLevel === 'Master') deptQuery.masterType = validatedMasterType;

    let department = await Department.findOne(deptQuery);
    if (!department) {
      department = await Department.create({
        ...deptQuery,
        program: departmentName, // Store the department name as the program
      });
    }

    // Create student
    const student = await Student.create({
      username,
      email,
      password,
      grade: grade._id,
      department: department._id,
      studentId: generateStudentId(),
    });

    res.status(201).json({
      status: 'success',
      data: {
        student: {
          id: student._id,
          username: student.username,
          email: student.email,
          grade: {
            level: grade.level,
            year: grade.year,
            masterType: grade.masterType,
          },
          department: {
            name: department.name,
            gradeLevel: department.gradeLevel,
            masterType: department.masterType,
          },
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

// Helper function to generate student ID
function generateStudentId() {
  return 'STU' + Math.floor(1000 + Math.random() * 9000);
}

// Get all available grade options
exports.getGradeOptions = async (req, res) => {
  try {
    const grades = [
      { level: 'Bachelor', year: '1st' },
      { level: 'Bachelor', year: '2nd' },
      { level: 'Bachelor', year: '3rd' },
      { level: 'Master', year: '1st', masterType: 'Research' },
      { level: 'Master', year: '1st', masterType: 'Professional' },
      { level: 'Master', year: '2nd', masterType: 'Research' },
      { level: 'Master', year: '2nd', masterType: 'Professional' },
    ];

    const options = grades.map(grade => ({
      level: grade.level,
      year: grade.year,
      masterType: grade.masterType,
      displayText: `${grade.level} - ${grade.year}${grade.masterType ? ` (${grade.masterType})` : ''}`,
    }));

    res.status(200).json({
      status: 'success',
      data: options,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Get departments based on grade selection
exports.getDepartmentOptions = async (req, res) => {
  try {
    const { level, masterType } = req.query;

    if (!level || !['Bachelor', 'Master'].includes(level)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or missing grade level',
      });
    }

    if (level === 'Master' && !['Research', 'Professional'].includes(masterType)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or missing master type',
      });
    }

    const validDepartments = {
      Bachelor: [
        'Computer Science',
        'Computer System Engineering',
        'Management Information System',
        'Management Science',
        'Economic Science',
      ],
      Master: {
        Research: ['Intelligent Information System', 'Finance'],
        Professional: [
          'Data Science (BI Technology)',
          'Distributed Networks and Applications (RAD, MP)',
          'Accounting-Control-Audit',
          'Entrepreneurship and Project Management (PM, EPM)',
          'Economic and Financial Engineering',
        ],
      },
    };

    let departments = [];
    if (level === 'Bachelor') {
      departments = validDepartments.Bachelor;
    } else {
      departments = validDepartments.Master[masterType];
    }

    res.status(200).json({
      status: 'success',
      data: departments.map(name => ({
        name,
        displayText: name,
      })),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};