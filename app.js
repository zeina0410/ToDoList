const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const coll = require("./collections.js");
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Connect to Mongoose
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: false
});
const db = mongoose.connection;

db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('MongoDB connected!'));

// default items
const i1= new coll.Item ({name:"Buy ingrediants."});
const i2= new coll.Item ({name:"Cook food."});
const i3= new coll.Item ({name:"Eat food."});
const defaultArray = [i1, i2, i3];

// home route
app.get("/", async (req, res)=> {
    try{
        let newItems = await coll.Item.find({});
        if(newItems.length==0){
            await coll.Item.insertMany(defaultArray);
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "today", newListItems:newItems});
        }
    } catch(err){
        console.log(err.message);
    }
});

app.get("/:customListName", async (req, res)=> {
    const customListName = _.capitalize(req.params.customListName);
    const found = await coll.List.findOne({name:customListName});
    if(!found){
        const list = new coll.List ({
            name:customListName, 
            items: defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
    } else {
        res.render("list", {listTitle:found.name, newListItems:found.items});
    }
});

// about
app.get("/about", (req, res)=> {
    res.render("about");
});

app.post("/", async (req, res)=> {
    try{
        const listName = req.body.list;
        const newItem = req.body.newItem;
        const item= new coll.Item ({name:newItem});
        if(listName === "today"){
            await item.save();
            res.redirect("/");
        } else {
            const found = await coll.List.findOne({name:listName});
            found.items.push(item);
            found.save();
            res.redirect("/" + listName);
        }
    } catch(err){
        console.log(err.message);
    }
})

app.post("/delete", async (req, res)=> {
    try{
        const checkedItemID = req.body.checkbox;
        const listName = req.body.listName;
        if(listName === "today"){
            await coll.Item.findByIdAndRemove(checkedItemID);
            res.redirect("/");
        } else {
            await coll.List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemID}}});
            res.redirect("/" + listName);
        }
    } catch(err){
        console.log(err.message);
    }
})

// Start server
app.listen(process.env.PORT, ()=> {
    console.log("Server started")
})