const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'erc20bridge',
    password: 'admin',
    port: 5432,
})

async function getBridgedTokensAmounts(address_from, address_to) {
    let response;

    try {
        response = await pool.query('SELECT * FROM public.bridged_tokens WHERE address_from = $1 AND address_to = $2 LIMIT 1',
            [address_from, address_to]);
    } catch (err) {
        console.error(err);
    }

    return response.rows;
}

async function getBridgedTokensAmount(address_from, address_to, event_type) {
    let response;

    let queryString = '';
    switch (event_type) {
        case 0:
            queryString = 'SELECT amount_locked FROM public.bridged_tokens WHERE address_from = $1 AND address_to = $2 LIMIT 1';
            break;
        case 1:
            queryString = 'SELECT amount_claimed FROM public.bridged_tokens WHERE address_from = $1 AND address_to = $2 LIMIT 1';
            break;
        case 2:
            queryString = 'SELECT amount_burned FROM public.bridged_tokens WHERE address_from = $1 AND address_to = $2 LIMIT 1';
            break;
        case 3:
            queryString = 'SELECT amount_released FROM public.bridged_tokens WHERE address_from = $1 AND address_to = $2 LIMIT 1';
            break;
        default:
            console.log("Wrong event type!");
    }

    try {
        response = await pool.query(queryString,
            [address_from, address_to]);
    } catch (err) {
        console.error(err);
    }

    return response.rows;
}

async function createBridgedToken(address_from, address_to, amount) {
    try {
        response = await pool.query(
            'INSERT INTO public.bridged_tokens(address_from, address_to, amount_locked, amount_claimed, amount_burned, amount_released) VALUES ($1, $2, $3, 0, 0, 0)',
            [address_from, address_to, amount])
    } catch (err) {
        console.error(err);
    }
}

async function updateBridgedToken(id, bridgedTokenAmountLocked, bridgedTokenAmountClaimed, bridgedTokenAmountBurned, bridgedTokenAmountReleased) {
    try {
        response = await pool.query(
            'UPDATE public.bridged_tokens SET amount_locked = $2, amount_claimed = $3, amount_burned = $4, amount_released = $5 WHERE id = $1',
            [id, bridgedTokenAmountLocked, bridgedTokenAmountClaimed, bridgedTokenAmountBurned, bridgedTokenAmountReleased],)
    } catch (err) {
        console.error(err);
    }
}

const getLockedTokensAmount = async (request, response) => {
    const { from, to } = request.query;

    var results = await getBridgedTokensAmount(from, to, 0);

    return response.status(200).json(results)
}

const getClaimedTokensAmount = async (request, response) => {
    const { from, to } = request.query;

    var results = await getBridgedTokensAmount(from, to, 1);

    return response.status(200).json(results)
}

const getBurnedTokensAmount = async (request, response) => {
    const { from, to } = request.query;

    var results = await getBridgedTokensAmount(from, to, 2);

    return response.status(200).json(results)
}

const getReleasedTokensAmount = async (request, response) => {
    const { from, to } = request.query;

    var results = await getBridgedTokensAmount(from, to, 3);

    return response.status(200).json(results)
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

const createEvent = async (request, response) => {
    const { from, to, amount, nonce, signature, step } = request.body;

    const eventBySignature = await getEventBySignature(signature);
    if (eventBySignature.length !== 0) {
        console.log("event already logged")
        return;
    }
    else {
        pool.query(
            'INSERT INTO public.events(address_from, address_to, amount, nonce, signed_message, event_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [from, to, amount, nonce, signature, step],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200)
            }
        )
    }

    let bridgedTokensArr;
    if (step == 0 || step == 1) {
        bridgedTokensArr = await getBridgedTokensAmounts(from, to);
    }
    else {
        bridgedTokensArr = await getBridgedTokensAmounts(to, from);
    }

    if (bridgedTokensArr.length !== 0) {
        const bridgedTokenEntry = bridgedTokensArr[0];

        let bridgedTokenAmountLocked = bridgedTokenEntry.amount_locked;
        let bridgedTokenAmountClaimed = bridgedTokenEntry.amount_claimed;
        let bridgedTokenAmountBurned = bridgedTokenEntry.amount_burned;
        let bridgedTokenAmountReleased = bridgedTokenEntry.amount_released;

        if (step == 0) {
            bridgedTokenAmountLocked += amount;
        }
        else if (step == 1) {
            bridgedTokenAmountLocked -= amount;
            bridgedTokenAmountClaimed += amount;
        }
        else if (step == 2) {
            bridgedTokenAmountClaimed -= amount;
            bridgedTokenAmountBurned += amount;
        }
        else if (step == 3) {
            bridgedTokenAmountBurned -= amount;
            bridgedTokenAmountReleased += amount;
        }
        console.log(bridgedTokenAmountLocked, bridgedTokenAmountClaimed, bridgedTokenAmountBurned, bridgedTokenAmountReleased);
        await updateBridgedToken(bridgedTokenEntry.id, bridgedTokenAmountLocked, bridgedTokenAmountClaimed, bridgedTokenAmountBurned, bridgedTokenAmountReleased);
    }
    else {
        await createBridgedToken(from, to, amount);
    }
}

async function getEventBySignature(signature) {
    let response;

    try {
        response = await pool.query('SELECT * FROM public.events WHERE signed_message = $1 LIMIT 1',
            [signature]);
    } catch (err) {
        console.error(err);
    }

    return response.rows;
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
    getLockedTokensAmount,
    getClaimedTokensAmount,
    getBurnedTokensAmount,
    getReleasedTokensAmount,

    getBridgedEventsByAddress,
    createEvent,

    getLastProcessedBlock,
    createLastProcessedBlock,
    updateLastProcessedBlock,
}