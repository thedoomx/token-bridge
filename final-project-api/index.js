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

app.get('/getNotClaimedEvents', db.getNotClaimedEvents)
app.get('/getNotReleasedEvents', db.getNotReleasedEvents)
app.get('/getBridgedEventsByAddress/:address', db.getBridgedEventsByAddress)

app.post('/event', db.createEvent)
app.put('/event/:address', db.deactiveEvent)


app.get('/lastprocessedblock', db.getLastProcessedBlock)
app.post('/lastprocessedblock', db.createLastProcessedBlock)
app.put('/lastprocessedblock/:id', db.updateLastProcessedBlock)

