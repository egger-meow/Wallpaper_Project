#!/usr/bin/env node

const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var fs = require("fs");
var path = require("path");
var multer = require("multer");

mongoose.connect(
    process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        console.log("db connected");
    }
);

// middleware
// https://www.tutorialspoint.com/expressjs/expressjs_middleware.htm
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Set EJS as templating engine
app.set("view engine", "ejs");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now());
    },
});

var upload = multer({ storage: storage });

var imgModel = require("./model");

console.log(imgModel);


// upload
app.get("/upload", (req, res) => {
    console.log("****** Upload page ******");
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred", err);
        } else {
            // https://medium.com/web-design-zone/ejs樣板引擎的使用方式-40873ea2dfae
            console.log("Rendering uploadPage");
            res.render("uploadPage", { items: items });
        }
    });
});

app.post("/upload", upload.single("image"), (req, res, next) => {
    console.log("Successfully uploading your image!!");
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        tag: req.body.tag,
        likes: 0,
        img: {
            data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
        },
    };
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        } else {
            // item.save();
            res.redirect("/upload");
        }
    });

});


// Search page
app.get("/search", (req, res) => {
    console.log("****** Search page ******");
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred", err);
        } else {
            console.log("Rendering searchPage");
            res.render("searchPage", { items: items });
        }
    });
});

app.post("/search", upload.single("image"), (req, res, next) => {
    // res.send(req.body);
    const search_query = "search_query=".concat(req.body.search_query);
    const query_string = "/result?".concat(search_query);
    res.redirect(query_string);
});

// result page
app.get("/result", (req, res) => {
    console.log("****** Result page ******");
    console.log("search_query: " + req.query.search_query);
    // res.send("search_query: " + req.query.search_query);
    let find = { tag: { $regex: req.query.search_query, $options: "i" } }
    if (req.query.search_query == '') {
        find = {}
    }
    imgModel.find(find,
        (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send("An error occurred", err);
            } else {
                console.log("Rendering resultPage");
                res.render("resultPage", { items: items });
            }
        }
    );
});

app.post("/update_likes", (req, res, next) => {
    console.log(req.body);

    imgModel.findByIdAndUpdate(req.body.id, { "likes": req.body.likes }, (err, item) => {
        if (err) {
            console.log(err);
        } else {

        }
    });
});

// get likes of a image
app.get("/get_likes", (req, res) => {
    console.log("****** get Likes ******");
    console.log("query id: " + req.query.id);

    imgModel.findById(req.query.id,
        (err, item) => {
            if (err) {
                console.log(err);
                res.status(500).send("An error occurred", err);
            } else {
                console.log("query likes: " + item.likes);
                res.json({ 'likes': item.likes });
            }
        }
    );
});

// hello page (for testing)
app.get("/hello", (req, res) => {
    res.render("hello");
    console.log("Hello world");
});

var port = process.env.PORT || "3000";
app.listen(port, (err) => {
    if (err) throw err;
    console.log("Server listening on port", port);
});