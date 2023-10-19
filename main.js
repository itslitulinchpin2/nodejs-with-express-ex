var express = require('express')
var app = express()
//app에는 어플리케이션 객체가 담겨있음.
var fs = require('fs');

var bodyParser = require('body-parser');
var compression = require('compression');
var topicRouter=require('./routes/topic')
var indexRouter=require('./routes/index')
//public 디렉토리 아래에서 스태틱 파일들을 찾겠다.
var helmet=require('helmet')
app.use(express.static('public'))
app.use(helmet())
//main.js가 실행될때 마다 아랫줄의 미들웨어 또한 실행된다.
//사용자가 전송한 포스트 데이터를 내부적으로 분석해서,
//데이터를 모두 가져온 다음 알아서 콜백을 호출해준다.
//request.body라는 프로퍼티를 미들웨어가 만들어준다.
app.use(bodyParser.urlencoded({ extended: false }))

app.use(compression())

// /topic으로 시작되는 url에는 토픽라우터라는 미들웨어를 적용함



app.get('*',function(request,response,next){
  fs.readdir('./data', function(error, filelist){
    
    //list라는 프로퍼티에 파일리스트를 주겠다.
    request.list = filelist;
    next()
  })
})
app.use('/',indexRouter)
app.use('/topic',topicRouter)

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//listen이 시작될때 웹서버가 실행된다.
app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})


