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
        await pool.query(
            'INSERT INTO public.bridged_tokens(address_from, address_to, amount_locked, amount_claimed, amount_burned, amount_released) VALUES ($1, $2, $3, 0, 0, 0)',
            [address_from, address_to, amount])
    } catch (err) {
        console.error(err);
    }
}

async function updateBridgedToken(id, bridgedTokenAmountLocked, bridgedTokenAmountClaimed, bridgedTokenAmountBurned, bridgedTokenAmountReleased) {
    try {
        await pool.query(
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

const createEvent = async (request, response) => {
    const { from, to, amount, nonce, signature, step, blockNumber } = request.body;

    const eventBySignature = await getEventBySignature(signature);
    if (eventBySignature.length !== 0) {
        console.log("event already logged")
        return response.status(400).json({ success: false });
    }
    else {
        try {
            await pool.query('INSERT INTO public.events(address_from, address_to, amount, nonce, signed_message, event_type) VALUES ($1, $2, $3, $4, $5, $6)',
                [from, to, amount, nonce, signature, step]);
        } catch (err) {
            console.error(err);
        }
    }

    await updateBridgedTokens(from, to, amount, step);

    await updateLastProcessedBlockByStep(blockNumber, step);

    return response.status(200).json({ success: true });
}

async function updateLastProcessedBlockByStep(blockNumber, step) {
    const lastProcessedBlocksArr = await getLastProcessedBlockArr();

    if (lastProcessedBlocksArr.length !== 0) {
        if (step == 0 || step == 3) {
            await updateLastProcessedBlock(
                lastProcessedBlocksArr[0].id, blockNumber, lastProcessedBlocksArr[0].last_processed_block_side);
        }
        else {
            await updateLastProcessedBlock(
                lastProcessedBlocksArr[0].id, lastProcessedBlocksArr[0].last_processed_block_main, blockNumber);
        }
    }
    else {
        await createLastProcessedBlock(blockNumber);
    }
}

async function updateBridgedTokens(from, to, amount, step) {
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

async function getLastProcessedBlockArr(address_from, address_to) {
    let response;

    try {
        response = await pool.query('SELECT * FROM public.processed_block LIMIT 1')
    } catch (err) {
        console.error(err);
    }

    return response.rows;
}

async function updateLastProcessedBlock(id, lastProcessedBlockMain, lastProcessedBlockSide) {
    try {
        await pool.query(
            'UPDATE public.processed_block SET last_processed_block_main = $2, last_processed_block_side = $3 WHERE id = $1',
            [id, lastProcessedBlockMain, lastProcessedBlockSide],)
    } catch (err) {
        console.error(err);
    }
}

async function createLastProcessedBlock(lastProcessedBlock) {
    try {
        await pool.query(
            'INSERT INTO public.processed_block(last_processed_block_main, last_processed_block_side) VALUES ($1, $2)',
            [lastProcessedBlock, 0],)
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getLockedTokensAmount,
    getClaimedTokensAmount,
    getBurnedTokensAmount,
    getReleasedTokensAmount,

    createEvent,

    getLastProcessedBlock
}