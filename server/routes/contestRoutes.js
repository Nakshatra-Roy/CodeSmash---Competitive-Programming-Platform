const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController.js');

router.get('/', contestController.getAllContests);
router.get('/:id', contestController.getContestById);
router.post('/', contestController.createContest);
router.post('/enroll', contestController.enrollContest);
router.post('/unenroll', contestController.unenrollContest);
router.put('/:id', contestController.updateContest);
router.delete('/:id', contestController.deleteContest);
module.exports = router;