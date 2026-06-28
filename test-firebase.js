require('dotenv').config({ path: '.env' });
const admin = require('firebase-admin');

try {
  console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log("Success");
} catch(e) {
  console.error("Failed:", e);
}
