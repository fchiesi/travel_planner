import { TripPlan } from '../types.ts';

const N8N_WEBHOOK_URL = 'https://fchiesi.app.n8n.cloud/webhook-test/820e41be-ccc5-47cf-96ee-0ee8a96a8571';

/**
 * Sends the selected trip plan data to an n8n webhook.
 * This is a "fire and forget" operation from the user's perspective.
 * Errors are logged to the console but not thrown, to avoid interrupting the user flow.
 * @param trip The trip plan selected by the user.
 */
export const sendTripToWebhook = async (trip: TripPlan): Promise<void> => {
  try {
    // Use `mode: 'no-cors'` to prevent the browser's CORS preflight check,
    // which can fail with some webhook providers. This makes the request "opaque",
    // meaning we can't inspect the response, but that's acceptable for a
    // "fire and forget" operation.
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the entire trip object as the body
      body: JSON.stringify(trip),
    });

    console.log('Trip data sent to webhook via opaque request.');

  } catch (error) {
    // Catch fundamental network errors etc.
    console.error('Error sending trip data to webhook:', error);
  }
};
