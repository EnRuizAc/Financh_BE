const express = require('express');
const router = express.Router();
const deleteRelation = require('../controllers/deleteRelationController');

router.route('/')
    .post(deleteRelation);

module.exports = router;