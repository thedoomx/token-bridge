import fetch from "node-fetch";
import { Step } from "./Step";

export async function getAvailableAmount(url: string, step: Step): Promise<number> {
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
            if(step == Step.Claim) {
                return data[0].amount_locked;
            }
            else if(step == Step.Burn) {
                return data[0].amount_claimed;
            }
            else if(step == Step.Release) {
                return data[0].amount_burned;
            }
        }

    } catch (error) {
        console.log('Error: ' + error);
    }

    return 0;
}