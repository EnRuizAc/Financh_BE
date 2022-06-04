const express = require('express');
const router = express.Router();
const companiesController = require('../../controllers/companiesController');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');
const ROLES_LIST = require('../../config/roles_list')




router.route('/')
    .get(companiesController.getAllCompanies);

router.route('/:accessCompanies')
    .post(companiesController.getAccessCompanies);

router.route('/:relationUserCompanyData')
    .get(companiesController.getRelationUserCompanyData)




module.exports = router;