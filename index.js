// Anyone poking around /api gets this. Nothing to see.
module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).end("what are u doing here");
};
