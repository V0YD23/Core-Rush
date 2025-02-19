module.exports = (req, res, next) => {
    if (req.protocol === "http") {
      res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
      next();
    }
  };
  