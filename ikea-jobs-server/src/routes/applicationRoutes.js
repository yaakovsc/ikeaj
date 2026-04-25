const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleApplication } = require('../controllers/applicationController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        cb(null, allowed.includes(file.mimetype));
    }
});

router.post('/send-application', upload.single('cvFile'), handleApplication);

module.exports = router;