module.exports = (req, res) => {
  res.json({
    projectId: process.env.FIREBASE_PROJECT_ID || 'undefined',
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    trimet: process.env.TRIMET_API_KEY || 'undefined'
  });
};
