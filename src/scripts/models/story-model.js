import { db } from '../API/firebase.js'; 
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const POINTS_COLLECTION_NAME = 'points';

export async function fetchPoints() {
  try {
    const querySnapshot = await getDocs(collection(db, POINTS_COLLECTION_NAME));
    const points = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return points;
  } catch (error) {
    console.error('Error fetching points:', error);
    throw new Error('Failed to fetch points: ' + error.message);
  }
}

export async function submitPoint(pointData) {
  try {
    const newPointRef = await addDoc(collection(db, POINTS_COLLECTION_NAME), {
      description: pointData.description,
      photoUrl: pointData.photoUrl,
      cloudinaryId: pointData.cloudinaryId,
      type: pointData.type,
      status: pointData.status,
      latitude: pointData.latitude,
      longitude: pointData.longitude,
      createdAt: new Date(),
    });

    return { id: newPointRef.id, ...pointData };
  } catch (error) {
    console.error('Error submitting point:', error);
    throw new Error('Failed to add point: ' + error.message);
  }
}

export async function updatePoint(pointId, updates) {
  try {
    const pointRef = doc(db, POINTS_COLLECTION_NAME, pointId);
    await updateDoc(pointRef, updates);
  } catch (error) {
    console.error('Error updating point:', error);
    throw new Error('Failed to update point: ' + error.message);
  }
}

async function deleteFromCloudinary(publicId) {
  try {
    const response = await fetch('/.netlify/functions/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });    

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete from Cloudinary via Netlify function');
    }
    console.log('Image deleted from Cloudinary successfully.');
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary: ' + error.message);
  }
}

export async function deletePoint(pointId) {
  try {
    const pointRef = doc(db, POINTS_COLLECTION_NAME, pointId);
    const pointSnapshot = await getDoc(pointRef);

    if (pointSnapshot.exists()) {
      const pointData = pointSnapshot.data();
      const publicId = pointData.cloudinaryId;

      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await deleteDoc(pointRef);
  } catch (error) {
    console.error('Error deleting point:', error);
    throw new Error('Failed to delete point: ' + error.message);
  }
}
