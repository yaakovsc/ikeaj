const { sendCandidateEmail, sendRecruiterEmail } = require('../services/mailer');

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
        ]);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Application Error:', error);
        res.status(500).json({ success: false, error: 'Failed to send emails' });
    }
};

module.exports = { handleApplication };