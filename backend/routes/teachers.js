const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();


router.post("/", async (req, res) =>
{
    try
    {
        const database = req.app.locals.database;
        const teachers = database.collection("teachers");


        const
        {
            email,
            firstName,
            lastName,
            teacherId,
            password,
            district,
            contactNumber,
            address
        } = req.body;


        if
        (
            !email ||
            !firstName ||
            !lastName ||
            !teacherId ||
            !password ||
            !district ||
            !contactNumber ||
            !address
        )
        {
            return res.status(400).json(
            {
                message: "Please fill all fields"
            });
        }


        const existingTeacher =
            await teachers.findOne(
            {
                $or:
                [
                    {
                        email: email
                    },

                    {
                        teacherId: teacherId
                    }
                ]
            });


        if (existingTeacher)
        {
            return res.status(409).json(
            {
                message:
                    "Teacher with this email or ID already exists"
            });
        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const teacher =
        {
            email: email,

            firstName: firstName,

            lastName: lastName,

            teacherId: teacherId,

            password: hashedPassword,

            district: district,

            contactNumber: contactNumber,

            address: address,

            createdAt: new Date()
        };


        const result =
            await teachers.insertOne(teacher);


        res.status(201).json(
        {
            message:
                "Teacher registered successfully",

            teacherId:
                result.insertedId
        });
    }
    catch (error)
    {
        console.error(
            "Teacher registration error:",
            error
        );


        res.status(500).json(
        {
            message:
                "Teacher registration failed",

            error:
                error.message
        });
    }
});


router.get("/", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const teachers =
            database.collection("teachers");


        const result =
            await teachers.find().toArray();


        res.json(result);
    }
    catch (error)
    {
        console.error(
            "Error getting teachers:",
            error
        );


        res.status(500).json(
        {
            message:
                "Failed to get teachers",

            error:
                error.message
        });
    }
});


module.exports = router;