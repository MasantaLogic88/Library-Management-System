const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();


const studentRoutes =
    require("./routes/students");

const collegeRoutes =
    require("./routes/colleges");

const teacherRoutes =
    require("./routes/teachers");

const bookRoutes =
    require("./routes/books");

const issueBookRoutes =
    require("./routes/issuebooks");


const app = express();


app.use(cors());

app.use(express.json());


const PORT =
    process.env.PORT || 5001;


const client =
    new MongoClient(
        process.env.MONGODB_URI
    );


let databasePromise = null;


/*
    Connect to MongoDB
*/

async function getDatabase()
{
    if (!databasePromise)
    {
        databasePromise =
            client.connect()
                .then(() =>
                {
                    console.log(
                        "MongoDB connected successfully"
                    );

                    return client.db(
                        "library_management"
                    );
                })
                .catch((error) =>
                {
                    databasePromise = null;

                    throw error;
                });
    }

    return databasePromise;
}


/*
    Make MongoDB available
    before every request
*/

app.use(
    async (req, res, next) =>
    {
        try
        {
            const database =
                await getDatabase();

            app.locals.database =
                database;

            next();
        }
        catch (error)
        {
            console.error(
                "MongoDB connection error:"
            );

            console.error(
                error
            );

            res.status(500).json(
            {
                message:
                    "MongoDB connection failed",

                error:
                    error.message
            });
        }
    }
);


/*
    Home Route
*/

app.get(
    "/",
    (req, res) =>
    {
        res.send(
            "Library Management System Backend is running"
        );
    }
);


/*
    Test MongoDB Connection
*/

app.get(
    "/test-db",
    async (req, res) =>
    {
        try
        {
            const database =
                app.locals.database;

            await database.command(
            {
                ping: 1
            });


            res.json(
            {
                message:
                    "MongoDB connection successful"
            });
        }
        catch (error)
        {
            res.status(500).json(
            {
                message:
                    "MongoDB connection failed",

                error:
                    error.message
            });
        }
    }
);


/*
    Student Routes
*/

app.use(
    "/api/students",
    studentRoutes
);


/*
    College Routes
*/

app.use(
    "/api/colleges",
    collegeRoutes
);


/*
    Teacher Routes
*/

app.use(
    "/api/teachers",
    teacherRoutes
);


/*
    Book Routes
*/

app.use(
    "/api/books",
    bookRoutes
);


/*
    Issue Book Routes
*/

app.use(
    "/api/issuebooks",
    issueBookRoutes
);


/*
    Export Express App
    for Vercel
*/

module.exports = app;


/*
    Start local server
    when running with:
    
    node server.js
*/

if (require.main === module)
{
    app.listen(
        PORT,
        () =>
        {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        }
    );
}