var express = require('express');
var router = express.Router();

router.get('/:diaryname/values/:format', function(req, res, next) {
  return res.send('TODO respond with a resource');
});

module.exports = router;
