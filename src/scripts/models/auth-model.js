import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../API/firebase.js';

const auth = getAuth(app);
const TOKEN_KEY = 'token';
const db = getFirestore(app);

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    saveToken(token);
    return token;
  } catch (error) {
    throw new Error(error.message || 'Login gagal' + error.message);
  }
}

export async function registerUser(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    saveToken(token);

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date()
    });

    return {
      token,
      message: 'Pendaftaran berhasil',
      error: false,
    };
  } catch (error) {
    return {
      token: '',
      message: error.message || 'Register gagal',
      error: true,
    };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      message: 'Email reset password telah dikirim.',
      error: false,
    };
  } catch (error) {
    return {
      message: error.message || 'Gagal mengirim email reset password.',
      error: true,
    };
  }
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
