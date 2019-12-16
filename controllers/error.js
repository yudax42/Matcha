exports.error404 = (req, res) => {
  res.status(404).render('errors/404');
}
