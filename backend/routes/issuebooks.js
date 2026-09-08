const express = require("express");

const router = express.Router();

/*
    Issue Book
*/
router.post("/", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const students =
            database.collection("students");

        const books =
            database.collection("books");

        const issuedBooks =
            database.collection("issued_books");

        const
        {
            firstName,
            lastName,
            rollNumber,
            bookNumber,
            bookName,
            dueDate,
            libraryId
        } = req.body;

        if
        (
            !rollNumber ||
            !bookNumber ||
            !dueDate ||
            !libraryId
        )
        {
            return res.status(400).json(
            {
                message:
                    "Please fill all required fields"
            });
        }

        const student =
            await students.findOne(
            {
                rollNumber:
                    rollNumber
            });

        if (!student)
        {
            return res.status(404).json(
            {
                message:
                    "Student with this roll number was not found"
            });
        }

        const book =
            await books.findOne(
            {
                bookNumber:
                    bookNumber
            });

        if (!book)
        {
            return res.status(404).json(
            {
                message:
                    "Book with this book number was not found"
            });
        }

        if (book.available === false)
        {
            return res.status(409).json(
            {
                message:
                    "This book is currently not available"
            });
        }

        const existingIssue =
            await issuedBooks.findOne(
            {
                bookNumber:
                    bookNumber,
                returned:
                    false
            });

        if (existingIssue)
        {
            return res.status(409).json(
            {
                message:
                    "This book has already been issued"
            });
        }

        const issueRecord =
        {
            firstName:
                student.firstName,
            lastName:
                student.lastName,
            rollNumber:
                student.rollNumber,
            bookNumber:
                book.bookNumber,
            bookName:
                book.bookName,
            subject:
                book.subject,
            author:
                book.author,
            dueDate:
                dueDate,
            libraryId:
                libraryId,
            issuedDate:
                new Date(),
            returned:
                false
        };

        await issuedBooks.insertOne(
            issueRecord
        );

        await books.updateOne(
        {
            bookNumber:
                bookNumber
        },
        {
            $set:
            {
                available:
                    false
            }
        });

        res.status(201).json(
        {
            message:
                "Book issued successfully",
            student:
            {
                firstName:
                    student.firstName,
                lastName:
                    student.lastName,
                rollNumber:
                    student.rollNumber
            },
            book:
            {
                bookName:
                    book.bookName,
                bookNumber:
                    book.bookNumber
            }
        });
    }
    catch (error)
    {
        console.error(
            "Book issue error:",
            error
        );

        res.status(500).json(
        {
            message:
                "Failed to issue book",
            error:
                error.message
        });
    }
});

/*
    Return Book
*/
router.put("/return", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const issuedBooks =
            database.collection("issued_books");

        const books =
            database.collection("books");

        const
        {
            rollNumber,
            bookNumber
        } = req.body;

        if
        (
            !rollNumber ||
            !bookNumber
        )
        {
            return res.status(400).json(
            {
                message:
                    "Please provide roll number and book number"
            });
        }

        const issuedBook =
            await issuedBooks.findOne(
            {
                rollNumber:
                    rollNumber,
                bookNumber:
                    bookNumber,
                returned:
                    false
            });

        if (!issuedBook)
        {
            return res.status(404).json(
            {
                message:
                    "No active issue record found for this student and book"
            });
        }

        await issuedBooks.updateOne(
        {
            _id:
                issuedBook._id
        },
        {
            $set:
            {
                returned:
                    true,
                returnedDate:
                    new Date()
            }
        });

        await books.updateOne(
        {
            bookNumber:
                bookNumber
        },
        {
            $set:
            {
                available:
                    true
            }
        });

        res.json(
        {
            message:
                "Book returned successfully",
            student:
            {
                firstName:
                    issuedBook.firstName,
                lastName:
                    issuedBook.lastName,
                rollNumber:
                    issuedBook.rollNumber
            },
            book:
            {
                bookName:
                    issuedBook.bookName,
                bookNumber:
                    issuedBook.bookNumber
            }
        });
    }
    catch (error)
    {
        console.error(
            "Book return error:",
            error
        );

        res.status(500).json(
        {
            message:
                "Failed to return book",
            error:
                error.message
        });
    }
});

/*
    Get All Issued Books
*/
router.get("/", async (req, res) =>
{
    try
    {
        const database =
            req.app.locals.database;

        const issuedBooks =
            database.collection("issued_books");

        const result =
            await issuedBooks.find().toArray();

        res.json(
        {
            count:
                result.length,
            issuedBooks:
                result
        });
    }
    catch (error)
    {
        console.error(
            "Error getting issued books:",
            error
        );

        res.status(500).json(
        {
            message:
                "Failed to get issued books",
            error:
                error.message
        });
    }
});

module.exports = router;