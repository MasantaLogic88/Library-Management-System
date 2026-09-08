const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();


// Register a new student

router.post("/", async (req, res) =>
{
    try
    {
        const database = req.app.locals.database;

        const students = database.collection("students");

        const
        {
            email,
            firstName,
            lastName,
            rollNumber,
            password,
            district,
            contactNumber,
            address
        } = req.body;


        // Check required fields

        if
        (
            !email ||
            !firstName ||
            !lastName ||
            !rollNumber ||
            !password ||
            !district ||
            !contactNumber ||
            !address
        )
        {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }


        // Check whether student already exists

        const existingStudent = await students.findOne({
            $or: [
                { email: email },
                { rollNumber: rollNumber }
            ]
        });


        if (existingStudent)
        {
            return res.status(409).json({
                message: "Student with this email or roll number already exists"
            });
        }


        // Encrypt password

        const hashedPassword = await bcrypt.hash(password, 10);


        // Create student object

        const student = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            rollNumber: rollNumber,
            password: hashedPassword,
            district: district,
            contactNumber: contactNumber,
            address: address,
            createdAt: new Date()
        };


        // Save student

        const result = await students.insertOne(student);


        res.status(201).json({
            message: "Student registered successfully",
            studentId: result.insertedId
        });
    }
    catch (error)
    {
        console.error("Student registration error:", error);

        res.status(500).json({
            message: "Failed to register student",
            error: error.message
        });
    }
});


// Student Login

router.post("/login", async (req, res) =>
{
    try
    {
        const database = req.app.locals.database;

        const students = database.collection("students");


        const
        {
            rollNumber,
            password
        } = req.body;


        // Check required fields

        if (!rollNumber || !password)
        {
            return res.status(400).json({
                message: "Please enter roll number and password"
            });
        }


        // Find student

        const student = await students.findOne({
            rollNumber: rollNumber
        });


        if (!student)
        {
            return res.status(401).json({
                message: "Invalid roll number or password"
            });
        }


        // Check password

        const passwordMatch =
            await bcrypt.compare(password, student.password);


        if (!passwordMatch)
        {
            return res.status(401).json({
                message: "Invalid roll number or password"
            });
        }


        // Login successful

        res.json({
            message: "Login successful",
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                rollNumber: student.rollNumber,
                email: student.email
            }
        });
    }
    catch (error)
    {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});


// Get all students

router.get("/", async (req, res) =>
{
    try
    {
        const database = req.app.locals.database;

        const students = database.collection("students");

        const result =
            await students.find().toArray();

        res.json(result);
    }
    catch (error)
    {
        console.error("Error getting students:", error);

        res.status(500).json({
            message: "Failed to get students",
            error: error.message
        });
    }
});


module.exports = router;