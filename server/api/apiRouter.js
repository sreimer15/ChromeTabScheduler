var userController = require('./users/userController');

 
module.exports = function(apiRouter){
  
  /* * * * * * * * * * * * * * * * * * * * * 
   *              User Routes              *
   * * * * * * * * * * * * * * * * * * * * */

  apiRouter.get('/users',           userController.getUsers);
  apiRouter.get('/users/:username', userController.getUserByName);
  apiRouter.post('/create',         userController.createUser);

  /* * * * * * * * * * * * * * * * * * * * * 
   *              Link Routes              *
   * * * * * * * * * * * * * * * * * * * * */

   // apiRouter.get('/links', linkController.getAllLinks);
}