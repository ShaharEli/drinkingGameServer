const notFound = (req, res) => {
  res.status(404).json({ error: "route not found" });
}; //TODO move from middlewares

module.exports = notFound;
