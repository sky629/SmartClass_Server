
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var services = require('./routes/services');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/services/checksno',services.checksno);
app.get('/services/test',services.test);
app.get('/services/join',services.join);
app.get('/services/login',services.login);
app.get('/services/atten',services.atten);
app.get('/services/showmyclass',services.showmyclass);
app.get('/services/showstat',services.showstat);
app.get('/services/showclasstoday',services.showclasstoday);
app.get('/services/assistclass',services.assistclass);
app.get('/services/getdatefromclass',services.getdatefromclass);
app.get('/services/getstufromclass',services.getstufromclass);
app.get('/services/message',services.message);
app.get('/services/messagecontent',services.messagecontent);
app.get('/services/messagelist',services.messagelist);
app.get('/services/regmsg',services.regmsg);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
