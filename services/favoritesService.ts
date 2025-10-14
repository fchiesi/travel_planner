
import firebase from 'firebase/compat/app';
import { TripPlan } from '../types.ts';
import { firestore } from './firebase.ts';

const usersCollection = firestore.collection('users');

export const getFavoriteTrips = async (userId: string): Promise<TripPlan[]> => {
    try {
        const snapshot = await usersCollection.doc(userId).collection('favorites').orderBy('favoritedAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => doc.data() as TripPlan);
    } catch (error) {
        console.error("Error fetching favorite trips from Firestore", error);
        // Returning empty array to prevent app crash
        return [];
    }
};

export const addFavoriteTrip = async (userId: string, trip: TripPlan): Promise<void> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { favoritedAt, ...tripData } = trip;
        const tripWithTimestamp = {
            ...tripData,
            favoritedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await usersCollection.doc(userId).collection('favorites').doc(trip.id).set(tripWithTimestamp);
    } catch (error) {
        console.error("Error adding favorite trip to Firestore", error);
        throw new Error('Não foi possível adicionar o roteiro aos favoritos.');
    }
};

export const removeFavoriteTrip = async (userId: string, tripId: string): Promise<void> => {
    try {
        await usersCollection.doc(userId).collection('favorites').doc(tripId).delete();
    } catch (error) {
        console.error("Error removing favorite trip from Firestore", error);
        throw new Error('Não foi possível remover o roteiro dos favoritos.');
    }
};
