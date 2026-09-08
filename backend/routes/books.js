const express = require("express");

const router = express.Router();


/*
    Add New Book
*/

router.post("/", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const books =
            database.collection("books");


        const
        {
            bookName,
            bookNumber,
            subject,
            author,
            available
        } = req.body;


        if
        (
            !bookName ||
            !bookNumber ||
            !subject ||
            !author
        )
        {
            return res.status(400).json(
            {
                message:
                    "Please fill all required fields"
            });
        }


        const existingBook =
            await books.findOne(
            {
                bookNumber:
                    bookNumber
            });


        if (existingBook)
        {
            return res.status(409).json(
            {
                message:
                    "A book with this book number already exists"
            });
        }


        const book =
        {
            bookName:
                bookName,

            bookNumber:
                bookNumber,

            subject:
                subject,

            author:
                author,

            available:
                available !== false,

            createdAt:
                new Date()
        };


        const result =
            await books.insertOne(book);


        res.status(201).json(
        {
            message:
                "Book added successfully",

            bookId:
                result.insertedId
        });
    }
    catch (error)
    {
        console.error(
            "Add book error:",
            error
        );


        res.status(500).json(
        {
            message:
                "Failed to add book",

            error:
                error.message
        });
    }
});


/*
    Search Books
*/

router.get("/", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const books =
            database.collection("books");


        const
        {
            subject,
            bookNumber,
            bookName
        } = req.query;


        let searchQuery = {};


        if (subject)
        {
            searchQuery.subject =
            {
                $regex:
                    subject,

                $options:
                    "i"
            };
        }


        if (bookNumber)
        {
            searchQuery.bookNumber =
            {
                $regex:
                    bookNumber,

                $options:
                    "i"
            };
        }


        if (bookName)
        {
            searchQuery.bookName =
            {
                $regex:
                    bookName,

                $options:
                    "i"
            };
        }


        const result =
            await books.find(
                searchQuery
            ).toArray();


        res.json(
        {
            count:
                result.length,

            books:
                result
        });
    }
    catch (error)
    {
        console.error(
            "Book search error:",
            error
        );


        res.status(500).json(
        {
            message:
                "Failed to search books",

            error:
                error.message
        });
    }
});


module.exports = router;