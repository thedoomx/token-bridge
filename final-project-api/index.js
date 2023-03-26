const express = require('express')
const bodyParser = require('body-parser')
const db = require('./queries')
const app = express()
const port = 3010

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

app.get('/getLockedTokensAmount', db.getLockedTokensAmount)
app.get('/getClaimedTokensAmount', db.getClaimedTokensAmount)
app.get('/getBurnedTokensAmount', db.getBurnedTokensAmount)
app.get('/getReleasedTokensAmount', db.getReleasedTokensAmount)

app.post('/event', db.createEvent)

app.get('/lastprocessedblock', db.getLastProcessedBlock)