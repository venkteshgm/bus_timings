require('dotenv').config();
const admin = require('firebase-admin');

// Hardcoded list of allowed emails
const ALLOWED_EMAILS = [
  'venkteshgm@gmail.com',
  'sharanyar0295@gmail.com'
];

module.exports = async (req, res) => {
  // Initialize Firebase Admin lazily to ensure env vars are loaded
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
      return res.status(500).json({ error: 'Server configuration error' });
    }
  }

  // 1. Verify Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // 2. Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userEmail = decodedToken.email;

    // 3. Check Allowed Emails
    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      return res.status(403).json({ error: 'Access denied. Email not on the allowlist.' });
    }

    // 4. Fetch from TriMet API
    const trimetAppId = process.env.TRIMET_API_KEY;
    if (!trimetAppId) {
      return res.status(500).json({ error: 'TriMet API key is not configured.' });
    }

    const locIDs = '14593,14595,9923';
    const trimetUrl = `https://developer.trimet.org/ws/V1/arrivals?locIDs=${locIDs}&appID=${trimetAppId}&json=true`;

    const trimetResponse = await fetch(trimetUrl);
    
    if (!trimetResponse.ok) {
      throw new Error(`TriMet API responded with status ${trimetResponse.status}`);
    }

    const trimetData = await trimetResponse.json();

    // 5. Filter for Bus 47 and format the response
    const arrivals = trimetData.resultSet.arrival || [];
    
    const filteredArrivals = arrivals
      .filter(arrival => arrival.route === 47)
      .map(arrival => ({
        stopId: arrival.locid,
        estimatedTime: arrival.estimated || arrival.scheduled,
        shortSign: arrival.shortSign,
        isEstimated: !!arrival.estimated
      }));

    return res.status(200).json({
      success: true,
      data: filteredArrivals,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error in bus-times endpoint:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
