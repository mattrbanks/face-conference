const mongoose = require("mongoose");
const createRoomsSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Room", createRoomsSchema);
