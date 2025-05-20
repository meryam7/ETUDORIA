import User from "../Model/User.model.js";
import Student from "../Model/Student.js";
import Grade from "../Model/Grade.js";
import Department from "../Model/Department.js";

export const validateStudentRegistration = async (req, res) => {
  try {
    const { username, email, password, gradeLevel, gradeYear, masterType, departmentName } = req.body;

    // Validate required fields (already validated by middleware, but adding for robustness)
    if (!username || !email || !password || !gradeLevel || !gradeYear || !departmentName) {
      return res.status(400).json({
        status: 'fail',
        message: 'All required fields must be provided',
      });
    }

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
    if (gradeLevel === 'Master') gradeQuery.masterType = masterType;

    let grade = await Grade.findOne(gradeQuery);
    if (!grade) {
      grade = await Grade.create(gradeQuery);
    }

    // Find or create department
    const deptQuery = { name: departmentName, gradeLevel };
    if (gradeLevel === 'Master') deptQuery.masterType = masterType;

    let department = await Department.findOne(deptQuery);
    if (!department) {
      department = await Department.create({
        ...deptQuery,
        name: departmentName,
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

    // Remove password from response
    student.password = undefined;

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

function generateStudentId() {
  return 'STU' + Math.floor(1000 + Math.random() * 9000);
}