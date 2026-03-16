const { sendActiveTrailEmail } = require('../services/activeTrailService');

const handleApplication = async (req, res) => {
    try {
        const { fullName, email, phone, job } = req.body;
        const jobObj = typeof job === 'string' ? JSON.parse(job) : job;
        
        const cvFileUrl = req.file 
            ? `${process.env.BASE_URL}/uploads/${req.file.filename}` 
            : null;

        const result = await sendActiveTrailEmail({
            fullName,
            email,
            phone,
            jobTitle: jobObj.description,
            cvFileUrl
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Controller Error:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = { handleApplication };