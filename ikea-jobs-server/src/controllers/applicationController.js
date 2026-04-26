const { sendCandidateEmail, sendRecruiterEmail } = require('../services/mailer');
const fetch = require('node-fetch');

const ADAM_BASE_URL = process.env.ADAM_API_BASE_URL;
const ADAM_TOKEN    = process.env.ADAM_API_TOKEN;

async function sendToAdam({ firstName, lastName, phone, email, orderId, cvFile }) {
    try {
        const files = [];
        if (cvFile) {
            const filename = Buffer.from(cvFile.originalname, 'latin1').toString('utf8');
            files.push({
                base64FileData:      cvFile.buffer.toString('base64'),
                filename,
                fileCode:            '1',
                documentDescription: 'קורות חיים',
            });
        }

        const response = await fetch(`${ADAM_BASE_URL}Candidate/AddCandidateWithFiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: ADAM_TOKEN,
                phones: [phone],
                candidateDetails: {
                    first_name: firstName,
                    last_name:  lastName,
                    phone1:     phone,
                    Email:      email,
                },
                orders: orderId ? [{ order_no: orderId }] : [],
                files,
                ReplaceCandDetails: true,
            }),
        });
        const data = await response.json();
        console.log('ADAM response:', data);
    } catch (err) {
        console.error('ADAM AddCandidateWithFiles error:', err.message);
    }
}

const handleApplication = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const fullName = `${firstName} ${lastName}`;
        const job = typeof req.body.job === 'string'
            ? JSON.parse(req.body.job)
            : req.body.job || {};

        const jobTitle  = job.description          || 'משרה כללית';
        const jobBranch = job.name_snif            || '';
        const jobDomain = job.order_def_prof_name1 || '';

        await Promise.all([
            sendCandidateEmail({ fullName, email, phone, jobTitle, jobBranch }),
            sendRecruiterEmail({ fullName, email, phone, jobTitle, jobBranch, jobDomain }, req.file || null),
            sendToAdam({ firstName, lastName, phone, email, orderId: job.order_id, cvFile: req.file || null }),
        ]);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Application Error:', error);
        res.status(500).json({ success: false, error: 'Failed to send emails' });
    }
};

module.exports = { handleApplication };