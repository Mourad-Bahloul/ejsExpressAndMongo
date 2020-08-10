const express = require('express')
const router = express.Router()
const Author = require('../models/Author')
const Book = require('../models/Book')

// Display all authors
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { authors: authors, searchOptions: { name: req.query.name } })
    } catch (error) {
        res.redirect('/')
    }

})

// Display form for creating an author
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// create a new author
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: "Error creating author: " + error
        })
    }
})

// show author details
router.get('/:id', async (req, res) => {
    try {
        let author = await Author.findById(req.params.id)
        let books = await Book.find({author: author.id}).limit(10)
        res.render('authors/view', { author: author, books: books })
    } catch (error) {
        console.error(error)
        res.redirect('/authors')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        let author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch (error) {
        console.error(error)
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        if (req.body.name && req.body.name != author.name) {
            author.name = req.body.name
            await author.save()
        }
        res.redirect(`${author.id}`)
    } catch (error) {
        console.error(error)
        if (author) {
            res.redirect(`${author.id}/edit`)
        }
        else {
            res.redirect('authors')
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let author = await Author.findById(req.params.id)
        await author.remove()
    } catch (error) {
        console.error('An error occured while deleting author : ', error)
    }
    res.redirect('/authors')
})

module.exports = router
