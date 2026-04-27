require('dotenv').config();
const express = require('express');
const cors = require('cors');
const applicationRoutes = require('./src/routes/applicationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', applicationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Ready to send emails via Nodemailer (Gmail SMTP)');
});