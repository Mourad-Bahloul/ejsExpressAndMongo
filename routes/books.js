const express = require('express')
const router = express.Router()
const Book = require('../models/Book')
const Author = require('../models/Author')

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

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
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch (error) {
        renderNewPage(res, book, error)
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (error) {
        console.error(error)
        res.redirect('/books')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec()
        res.render('books/view', { book: book })
    } catch (error) {
        console.error(error)
        res.redirect('/')
    }
})

router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        if (req.body.title) book.title = req.body.title
        if (req.body.author) book.author = req.body.author
        if (req.body.description) book.description = req.body.description
        if (req.body.pageCount) book.pageCount = req.body.pageCount
        if (req.body.publishDate) book.publishDate = new Date(req.body.publishDate)
        if (req.body.cover) saveCover(book, req.body.cover)
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.error(error)
        if (book) {
            renderEditPage(res, book, error)
        }
        else {
            res.redirect('/')
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        console.error(error)
        if (book) {
            res.render('books/view', { book: book, errorMessage: 'Error while deleting book' })
        }
        else { res.redirect('/books') }
    }
})

async function renderNewPage(res, book, someError) {
    renderFormPage(res, book, 'new', someError)
}

async function renderEditPage(res, book, someError) {
    renderFormPage(res, book, 'edit', someError)
}

async function renderFormPage(res, book, form, someError) {
    try {
        const authors = await Author.find({})
        const params = {
            book: book,
            authors: authors
        }
        if (someError) {
            params.errorMessage = 'Error(s): ' + someError
        }
        res.render('books/' + form, params)
    } catch (error) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (!coverEncoded) { return }

    const cover = JSON.parse(coverEncoded)
    if (cover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router
