const express = require('express');
const { getData } = require('../controllers/data');

const router = express.Router();

router
  .route('/')
  .get(getData)

module.exports = router;
