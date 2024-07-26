// routes/weather.js
const express = require('express');
const router = express.Router();
const weatherCtrl = require("../controllers/weatherCtrl");

router.get('/summaries', weatherCtrl.fetchSummary);
router.get('/alerts', weatherCtrl.fetchAlert);

module.exports = router;
