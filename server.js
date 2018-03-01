const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const api = require('./routes/api')
const userlogin = require('./routes/userlogin')
const bodyParser = require('body-parser')
var path = require('path')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use('/api', api)
app.post('/register', userlogin.register)
app.post('/login', userlogin.login)

process.on('uncaughtException', (err) => {
  console.log('uncaughtException ' + err)
})

// for front end
// need to put at the last
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, () => console.log(`Listening on ${port}`))
