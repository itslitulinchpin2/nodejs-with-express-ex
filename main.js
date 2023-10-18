var express = require('express')
var app = express()
//app에는 어플리케이션 객체가 담겨있음.
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');
var bodyParser = require('body-parser');
var compression = require('compression');

//main.js가 실행될때 마다 아랫줄의 미들웨어 또한 실행된다.
//사용자가 전송한 포스트 데이터를 내부적으로 분석해서,
//데이터를 모두 가져온 다음 알아서 콜백을 호출해준다.
//request.body라는 프로퍼티를 미들웨어가 만들어준다.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())
app.get('*',function(request,response,next){
  fs.readdir('./data', function(error, filelist){
    
    //list라는 프로퍼티에 파일리스트를 주겠다.
    request.list = filelist;
    next();
  })
})

const port = 3000
//get 뒤의 첫번째 인자는 path, routing을 위함
app.get('/', function(request, response){
  
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);

})

app.get('/page/:pageId', function(request,response){
  console.log("지금 콘솔: ",request.list);
  
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      });
      var list = template.list(request.list);
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      response.send(html)
    });
  
})

app.get('/create',function(request,response){
 
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);
  });

app.post('/create_process', function(request,response){
  /*
  var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.redirect(`/page/${title}`)
          })
      });
      */

  var post = request.body;
  var title = post.title;
  var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/page/${title}`)
      })

})


app.get('/update/:pageId',function(request,response){
  
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      response.send(html);
    });

})

app.post('/update_process', function(request,response){
  var body = '';
      
          var post = request.body;
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.redirect(`/page/${title}`)
            })
          });
      });
  

app.post('/delete_process',function(request,response){
  
     
          var post = request.body
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.redirect('/')
          })
      });



//listen이 시작될때 웹서버가 실행된다.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

