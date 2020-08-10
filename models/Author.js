const mongoose = require('mongoose')
const Book = require('./Book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next){
    Book.find({author: this.id}, (err, books) => {
        if (err) {
            next(err)
        }
        else if (books && books.length > 0) {
            // don't pemit author deleting
            next(new Error('This author still has books'))
        }
        else {
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)
