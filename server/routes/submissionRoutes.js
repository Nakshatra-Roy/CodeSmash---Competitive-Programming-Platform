const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController.js');

router.get('/', submissionController.getAllSubmissions);
router.get('/:id', submissionController.getSubmissionById);
router.post('/', submissionController.createSubmission);
router.put('/:id', submissionController.updateSubmission);
router.delete('/:id', submissionController.deleteSubmission);
module.exports = router;