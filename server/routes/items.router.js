const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

// This gets all items for the selected chapter
router.get('/:id', (req, res) => {
  const chapterId = req.params.id;
  
  const queryText = `SELECT * FROM items
    WHERE chapter_id = ${chapterId}`;

  pool.query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      console.log('Error in GET /items', error)
      res.sendStatus(500);
  });
});

// This gets items in the same language for study session
router.get('/language/:id', (req, res) => {
  const languageId = req.params.id;

  const queryText = `SELECT * FROM items
    WHERE language_id = ${languageId}`;

  pool.query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      console.log('Error in GET /items/language', error)
      res.sendStatus(500);
  });
});

// This updates all items' 'learned_status' to false in the selected chapter
// then updates all items' 'repetition' to 0 in the selected chapter
router.put('/reset/learned', (req, res) => {
  const chapterId = req.body.params.chapterId;
  const userId = req.body.params.userId;

  const queryText = `UPDATE user_items SET "learned_status" = false
    WHERE "item_chapter_id" = ${chapterId}
    AND "item_user_id" = ${userId};`;

  pool.query(queryText)
    .then(result => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error in PUT /items/reset/learned', error);
      res.sendStatus(500);
  });
});

router.put('/reset/repetition', (req, res) => {
  const chapterId = req.body.params.chapterId;
  const userId = req.body.params.userId;

  const queryText = `UPDATE user_items SET "repetition" = 0 
  WHERE "item_chapter_id" = ${chapterId}
  AND "item_user_id" = ${userId};`;

  pool.query(queryText)
    .then(result => {
      res.sendStatus(201);
    })
    .catch(error => {
      console.log('Error in PUT /items/reset/repetition', error);
      res.sendStatus(500)
  });
});

// This updates all items' 'learned_status' to false in the selected deck
// then updates all items' 'repetition' to 0 in the selected deck
router.put('/reset/deck/learned', (req, res) => {
  const deckId = req.body.params.deckId;
  const userId = req.body.params.userId;

  const queryText = `UPDATE user_items SET "learned_status" = false
    WHERE "item_deck_id" = ${deckId}
    AND "item_user_id" = ${userId};`;

  pool.query(queryText)
    .then(result => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error in PUT /items/reset/deck/learned', error);
      res.sendStatus(500);
  });
});

router.put('/reset/deck/repetition', (req, res) => {
  const deckId = req.body.params.deckId;
  const userId = req.body.params.userId;

  const queryText = `UPDATE user_items SET "repetition" = 0 
  WHERE "item_deck_id" = ${deckId}
  AND "item_user_id" = ${userId};`;

  pool.query(queryText)
  .then(result => {
    res.sendStatus(201);
  })
  .catch(error => {
    console.log('Error in PUT /items/reset/deck/repetition', error);
    res.sendStatus(500)
  });
});

router.post('/', (req, res) => {
  const itemValues = [
    req.body.chapter_id,
    req.body.item,
    req.body.description,
    req.body.custom,
    req.body.hint,
    req.body.image,
    req.body.language_id
  ]
  const queryText = `INSERT INTO "items" (chapter_id, item, description, custom, hint, image, language_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING i_id;`;

  pool.query(queryText, itemValues)
    .then(result => {
      const userItemValues = [
        req.body.user_id,
        result.rows[0].i_id,
        req.body.chapter_id,
        req.body.deck_id
      ]
      const secondQuery = `INSERT INTO "user_items" (item_user_id, item_id, item_chapter_id, item_deck_id)
        VALUES ($1, $2, $3, $4)`;

      pool.query(secondQuery, userItemValues)
        .then(result => {
          res.sendStatus(201);
        })
        .catch((error) => {
          console.log('Error posting new item/userItems: ', error);
          res.sendStatus(500);
      })
    })
    .catch((error) => {
      console.log('Error posting new item: ', error);
      res.sendStatus(500);
  });
});

router.put('/update', (req, res) => {
  const itemValues = [
    req.body.item,
    req.body.description,
    req.body.audio,
    req.body.image,
    req.body.custom,
    req.body.hint,
    req.body.i_id,
    req.body.chapter_id
  ]

  const queryText = `UPDATE "items" 
    SET item = $1, description = $2, audio = $3, 
    image = $4, custom = $5, hint = $6
    WHERE "i_id" = $7 AND chapter_id = $8;`;

  pool.query(queryText, itemValues)
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error in PUT /items/update', error);
      res.sendStatus(500);
  });
});

router.delete('/:id', (req, res) => {
  const queryText = `DELETE FROM user_items WHERE "item_id" = $1;`;

  pool.query(queryText, [req.params.id])
    .then((result) => {
      const secondQuery = `DELETE FROM items WHERE "i_id" = $1;`;

      pool.query(secondQuery, [req.params.id])
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log('Error in DELETE /items', error);
        res.sendStatus(500);
    })
    .catch((error) => {
      console.log('Error in DELETE /items', error);
      res.sendStatus(500);
  })});
});

router.put('/set/correct', (req, res) => {
  const itemId = req.body[0];
  const queryText = `UPDATE "user_items" 
    SET repetition = repetition + 5, learned_status = true 
    WHERE item_id = $1 AND item_user_id = $2`;

  pool.query(queryText, [itemId, req.user.id])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error in PUT /items/set/correct', error);
      res.sendStatus(500);
  });
});

router.put('/set/wrong', (req, res) => {
  const itemId = req.body[0];
  const queryText = `UPDATE "user_items" 
    SET repetition = repetition - 5, learned_status = true 
    WHERE item_id = $1 AND item_user_id = $2`;

  pool.query(queryText, [itemId, req.user.id])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log('Error in PUT /items/set/correct', error);
      res.sendStatus(500);
  });
});

module.exports = router;