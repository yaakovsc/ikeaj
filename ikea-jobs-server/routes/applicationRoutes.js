const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleApplication } = require('../controllers/applicationController');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Route definition
router.post('/send-application', upload.single('cvFile'), handleApplication);

module.exports = router;