import fetch from "node-fetch";

export async function getAvailableAmount(url: string): Promise<number> {
    try {
        const response = await fetch(url, {
            method: "get",
        });

        if (!response.ok) {
            const message = 'Error with Status Code: ' + response.status;
            throw new Error(message);
        }

        const data = await response.json();
        if (data.length > 0) {
            return data[0].amount;
        }

    } catch (error) {
        console.log('Error: ' + error);
    }

    return 0;
}