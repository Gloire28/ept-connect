const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/eptconnect-local');
    console.log('Test OK - Connecté !');
    process.exit(0);
  } catch (err) {
    console.error('Test KO :', err.message);
    process.exit(1);
  }
})();