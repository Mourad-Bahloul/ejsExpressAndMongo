if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + "/views")
app.set('layout', 'layouts/layout')
app.use(express.static('public'))

const expressLayouts = require('express-ejs-layouts')
app.use(expressLayouts)

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})    
const db = mongoose.connection
db.on('error', (error) => { console.error(error) })
db.once('open', () => console.log('Database connected'))

const indexRouter = require('./routes/index')
app.use('/', indexRouter)

const authorRouter = require('./routes/authors')
app.use('/authors', authorRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started')
})
