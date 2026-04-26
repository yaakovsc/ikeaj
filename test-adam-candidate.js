/**
 * Test script: submit a candidate to ADAM AddCandidateWithFiles
 * Run from repo root: node test-adam-candidate.js
 * Or from container: node /app/../test-adam-candidate.js
 */
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const BASE_URL = process.env.ADAM_API_BASE_URL || 'https://services.adamtotal.co.il/api/';
const TOKEN    = process.env.ADAM_API_TOKEN    || '45563CBE-BA8F-4960-8198-0D4C334DD29C';

// ── Minimal valid PDF (empty 1-page) in base64 ──────────────────────────────
const DUMMY_PDF_BASE64 =
  'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE5MAolJUVPRgo=';

const payload = {
  token: TOKEN,
  phones: ['0501234567'],
  candidateDetails: {
    first_name: 'טסט',
    last_name:  'מועמד',
    phone1:     '0501234567',
    Email:      'test.candidate@example.com',
  },
  orders: [],          // no specific job — general application
  files: [
    {
      base64FileData:      DUMMY_PDF_BASE64,
      filename:            'cv_test.pdf',
      fileCode:            '1',
      documentDescription: 'קורות חיים',
    },
  ],
  ReplaceCandDetails: true,
};

console.log('\n── ADAM AddCandidateWithFiles test ─────────────────────');
console.log('URL   :', `${BASE_URL}Candidate/AddCandidateWithFiles`);
console.log('Token :', TOKEN.slice(0, 8) + '...');
console.log('Payload (without file data):');
const display = { ...payload, files: payload.files.map(f => ({ ...f, base64FileData: '<base64>' })) };
console.log(JSON.stringify(display, null, 2));
console.log('────────────────────────────────────────────────────────\n');

axios.post(
  `${BASE_URL}Candidate/AddCandidateWithFiles`,
  payload,
  { headers: { 'Content-Type': 'application/json' } }
).then(res => {
  console.log('✓ Status  :', res.status);
  console.log('✓ Response:', JSON.stringify(res.data, null, 2));
}).catch(err => {
  console.error('✗ Status  :', err.response?.status);
  console.error('✗ Response:', JSON.stringify(err.response?.data, null, 2));
  console.error('✗ Message :', err.message);
});
