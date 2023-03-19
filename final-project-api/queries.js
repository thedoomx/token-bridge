const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'erc20bridge',
    password: 'admin',
    port: 5432,
})

// locked = 1
// claimed = 2
// burned = 3
// released = 4

const getNotClaimedEvents = (request, response) => {
    pool.query('SELECT * FROM public.events WHERE event_type = 1', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getNotReleasedEvents = (request, response) => {
    pool.query('SELECT * FROM public.events WHERE event_type = 3', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getBridgedEventsByAddress = (request, response) => {
    const address = parseInt(request.params.address)

    pool.query('SELECT * FROM public.events WHERE address_from = $1 event_type = 2 OR event_type = 4 ', 
    [address],
    (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createEvent = (request, response) => {
    const { address_from, address_to, amount, event_type, isActive } = request.body

    pool.query(
        'INSERT INTO public.events(address_from, address_to, amount, event_type, isActive) VALUES ($1)',
        [address_from, address_to, amount, event_type, isActive],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200)
        }
    )
}

const deactiveEvent = (request, response) => {
    const address = parseInt(request.params.address)

    pool.query(
        'UPDATE public.processed_block SET isActive = 0 WHERE id = $1',
        [address],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200)
        }
    )
}


const getLastProcessedBlock = (request, response) => {
    pool.query('SELECT * FROM public.processed_block LIMIT 1', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const updateLastProcessedBlock = (request, response) => {
    const id = parseInt(request.params.id)
    const { lastProcessedBlock } = request.body

    pool.query(
        'UPDATE public.processed_block SET last_processed_block = $1 WHERE id = $2',
        [lastProcessedBlock, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200)
        }
    )
}

const createLastProcessedBlock = (request, response) => {
    const { lastProcessedBlock } = request.body

    pool.query(
        'INSERT INTO public.processed_block(last_processed_block) VALUES ($1)',
        [lastProcessedBlock],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200)
        }
    )
}



module.exports = {
    getNotClaimedEvents,
    getNotReleasedEvents,
    getBridgedEventsByAddress,
    createEvent,
    deactiveEvent,
    getLastProcessedBlock,
    createLastProcessedBlock,
    updateLastProcessedBlock,
}