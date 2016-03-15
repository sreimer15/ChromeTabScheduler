module.exports = function(app,express){
  // Create our router
  var apiRouter = express.Router();
  // Set up the address it will exist on
  app.use('/api', apiRouter);
  // Give it the restful properties that we will define in our apiRouter.js file
  require('./api/apiRouter.js')(apiRouter);
  
}