
import { TripPlan } from '../types.ts';
import { firestore } from './firebase.ts';
import firebase from 'firebase/compat/app';

const MAX_PROFILE_ENTRIES = 5;

const usersCollection = firestore.collection('users');

export const getUserProfile = async (userId: string): Promise<string> => {
    try {
        const snapshot = await usersCollection.doc(userId).collection('profile').orderBy('timestamp', 'desc').limit(MAX_PROFILE_ENTRIES).get();
        if (snapshot.empty) {
            return '';
        }
        const profileData = snapshot.docs.map(doc => doc.data().summary as string);
        return `As preferências anteriores do usuário são: ${profileData.join('; ')}.`;
    } catch (error) {
        console.error("Failed to read user profile from Firestore", error);
        return '';
    }
}

export const saveTripChoice = async (userId: string, trip: TripPlan): Promise<void> => {
    try {
        const summary = `uma viagem de ${trip.durationDays} dias para ${trip.destinationName} usando ${trip.transportationDetails.mode}, com um custo base de aproximadamente ${trip.baseCost} BRL`;

        // We use a random ID for the document to store multiple profile entries
        await usersCollection.doc(userId).collection('profile').add({
            summary,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error("Failed to save trip choice to Firestore", error);
        // Don't throw error to not interrupt user flow
    }
}
