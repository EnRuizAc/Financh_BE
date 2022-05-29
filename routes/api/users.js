const express = require('express');
const router = express.Router();
const getAllUsers = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/')
    .get(getAllUsers);
    

module.exports = router;