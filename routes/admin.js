const express = require('express');
const router = express.Router();


router.get('/users', function(req, res) {
  checkAdminUid(req, res, () => {
    const page = pug.compileFile(tplDir + 'admin/users.pug');
    res.send(page(variables));
  });
});