var morgan = require('morgan'),
    bodyParser = require('body-parser'),
    cors = require('cors');


module.exports = function(app, express){
  app.use(express.static(__dirname + '/../')) // serve static content from above directory;
  app.use(cors());
  app.use(bodyParser.urlencoded( { extended: true } )); // enable JSON-like support in query string
  app.use(bodyParser.json()); // parse JSON and place in req.body
}