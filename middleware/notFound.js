const notFound = (req, res, next) => {
  // add that message to constants
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({ message: "Route Doesnt Exist" });
  next(error);
};
module.exports = notFound;
