const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.get('/', (req, res) => {
    pool.query(`SELECT * FROM "languages";`
    ).then((result) => {
        res.send(result.rows);
    }).catch((error) => {
        console.log('Error in GET /api/languages:', error)
        res.sendStatus(500);
    });
});

module.exports = router;