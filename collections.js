const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String
});
exports.Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
exports.List = mongoose.model("List", listSchema);