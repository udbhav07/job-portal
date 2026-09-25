const mongoose = require("mongoose");

// reject malformed ids early with a 400 instead of a Mongoose CastError (500)
const validateId = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  next();
};

module.exports = validateId;
