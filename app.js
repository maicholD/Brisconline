var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var cors = require('cors');

var bodyParser = require('body-parser');

//app.use(cors);
app.use(cors({
  origin: ["https://localhost:3000"],
  credentials: true
}));

global.approot = path.resolve(__dirname);
mongoose.connect('mongodb+srv://lorenzo:CoccinellaBella99@brisconlinecluster-ffvdz.gcp.mongodb.net/brisconline?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});


app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'ssshhhhh',
  saveUninitialized: true,
  resave: true,
  userid: ""
}));
var bRoutes = require('./src/routes/brisconlineRoutes');
bRoutes(app);

app.listen(3000, function() {
  console.log('Node API server started on port 3000!');
});
