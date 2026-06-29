import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC0FTxyHm8qGd69qhRvzenyEMQ4WUPVDQ8',
  authDomain: 'solar-vision-e9a5f.firebaseapp.com',
  projectId: 'solar-vision-e9a5f',
  storageBucket: 'solar-vision-e9a5f.firebasestorage.app',
  messagingSenderId: '331092058573',
  appId: '1:331092058573:web:99c2fd38b325d0e1f8e484',
  measurementId: 'G-T89YR9YFGE',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
