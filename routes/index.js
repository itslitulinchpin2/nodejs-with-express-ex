var express = require('express');
const router = express.Router();
var template = require('../lib/template.js');

router.get('/', function(request, response){
  
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img style="width:450px; diaplay:block; margin:10px" src="/images/hello.jpg">`
,
      `<a href="/topic/create">create</a>`
    );
    response.send(html);

})

module.exports=router;