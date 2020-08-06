const express = require('express')
const router = express.Router()
const Book = require('../models/Book')
const Author = require('../models/Author')

const path = require('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const multer = require('multer')
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
const fs = require('fs')

// Display all books
router.get('/', async (req, res) => {
    let booksQuery = Book.find()
    if (req.query.title) {
        booksQuery = booksQuery.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore) {
        booksQuery = booksQuery.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter) {
        booksQuery = booksQuery.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await booksQuery.exec()
        res.render('books/index', { books: books, searchOptions: req.query })
    } catch (error) {
        res.redirect('/')
    }
})

// Display form for creating an book
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// create a new book
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (error) {
        if (book.coverImageName) removeBookCover(book.coverImageName)
        renderNewPage(res, book, error)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName),
        err => { if (err) console.err(err) })
}

async function renderNewPage(res, book, someError) {
    try {
        const authors = await Author.find({})
        const params = {
            book: book,
            authors: authors
        }
        if (someError) {
            params.errorMessage = 'Error(s): ' + someError
        }
        console.log('Rendering new book for params: ', params)
        res.render('books/new', params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router
