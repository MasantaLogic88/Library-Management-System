const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/", async (req, res) =>
{
    try
    {
        const database = req.app.locals.database;
        const colleges = database.collection("colleges");

        const
        {
            email,
            collegeName,
            registrationNumber,
            password,
            district,
            contactNumber,
            address
        } = req.body;


        if
        (
            !email ||
            !collegeName ||
            !registrationNumber ||
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


        const existingCollege =
            await colleges.findOne(
            {
                $or:
                [
                    {
                        email: email
                    },

                    {
                        registrationNumber:
                            registrationNumber
                    }
                ]
            });


        if (existingCollege)
        {
            return res.status(409).json(
            {
                message:
                    "College with this email or registration number already exists"
            });
        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const college =
        {
            email: email,

            collegeName: collegeName,

            registrationNumber:
                registrationNumber,

            password:
                hashedPassword,

            district: district,

            contactNumber:
                contactNumber,

            address: address,

            createdAt: new Date()
        };


        const result =
            await colleges.insertOne(college);


        res.status(201).json(
        {
            message:
                "College registered successfully",

            collegeId:
                result.insertedId
        });
    }
    catch (error)
    {
        console.error(
            "College registration error:",
            error
        );

        res.status(500).json(
        {
            message:
                "College registration failed",

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

        const colleges =
            database.collection("colleges");


        const result =
            await colleges.find().toArray();


        res.json(result);
    }
    catch (error)
    {
        console.error(
            "Error getting colleges:",
            error
        );

        res.status(500).json(
        {
            message:
                "Failed to get colleges",

            error:
                error.message
        });
    }
});


module.exports = router;