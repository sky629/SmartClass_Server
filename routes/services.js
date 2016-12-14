var mysql = require('mysql');
var gcm = require('node-gcm');

var pool = mysql.createPool({
	host:'54.201.33.197',
	port:3306,
	user:'root',
	password:'root',
	database:'smartclass'
});

exports.test = function(req, res){
	pool.getConnection(function(err, connection){
		connection.query('select * from student', function(err,rows){
			connection.release();
			res.charset = "utf-8";
			res.json(rows);
		});
	});
};

exports.checksno = function(req,res){
	pool.getConnection(function(err, connection){
		connection.query('select * from student where sno = ?',[req.query.sno],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.join = function(req, res){
	pool.getConnection(function(err, connection){
		connection.query('update student set phone = ?,pwd = ? where sno = ?',[req.query.phone,req.query.pwd,req.query.sno],function(err,rows){
			connection.release();
			res.send(200,'true');
		});
	});
};


exports.login = function(req, res){
	pool.getConnection(function(err, connection){
		connection.query('select sno from student where sno = ? and pwd = ?',[req.query.sno,req.query.pwd],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				connection.query('update student set rid = ? where sno =?',[req.query.rid,req.query.sno],function(err,rows){
					connection.release();
				});
				res.send(200,'true');
			}
		});
	});
};

exports.atten = function(req, res){
	pool.getConnection(function(err,connection){
		connection.query('update checkAttendance set check_class = ? where sno = ? and class_date = ? and cno = ?',[req.query.check_class,req.query.sno,req.query.class_date,req.query.cno],function(err,rows){
			connection.release();
			res.send(200,'true');
		});
	});
};

exports.showmyclass = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select cname from class where cno in (select cno from timetable where sno = ?)',[req.query.sno],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.showstat = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select * from checkAttendance where sno = ? and cno in (select cno from class where cname = ?)',[req.query.sno,req.query.cname],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.showclasstoday = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select * from class where (dayofweek like "%"?"%") and cno in (select cno from timetable where sno = ?)',[req.query.dayofweek,req.query.sno],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.assistclass = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select cno,cname from class where aname in (select aname from assistant where ano = ?)',[req.query.ano],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.getdatefromclass = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select distinct class_date from checkAttendance where cno = ?',[req.query.cno],function(err,rows){
			connection.release();
			res.charset = "utf-8";
			res.json(rows);
		});
	});
};

exports.getstufromclass = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select sno,class_date,check_class from checkAttendance where cno = ? and class_date = ?',[req.query.cno,req.query.class_date],function(err,rows){
			connection.release();
			res.charset = "utf-8";
			res.json(rows);
		});
	});
};

exports.message = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select class.cno,message,send_date,message_id,cname from message,class where message.cno in (select class.cno from class where aname in (select aname from assistant where ano = ?)) and class.cno = message.cno order by message_id desc',[req.query.ano],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.messagecontent = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select class.cno,send_date,cname,message from message,class where message_id = ? and message.cno = class.cno',[req.query.message_id],function(err,rows){
			connection.release();
			res.charset = "utf-8";
			res.json(rows);
		});
	});
};

exports.messagelist = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('select message_id,send_date,cname,message,class.cno from message,class where class.cno in (select cno from timetable where sno = ?) and class.cno = message.cno order by message_id desc',[req.query.sno],function(err,rows){
			connection.release();
			if(rows.length == 0){
				res.send(200,'false');
			}else{
				res.charset = "utf-8";
				res.json(rows);
			}
		});
	});
};

exports.regmsg = function(req,res){
	pool.getConnection(function(err,connection){
		connection.query('insert into message (cno,message,send_date) values (?,?,curdate())',[req.query.cno,req.query.msg],function(err,rows){
			connection.release();
			gcm_push(req.query.cno);
			res.send(200,'true');
		});
	});
};

function gcm_push(cno){
	var message = new gcm.Message();

	var sender = new gcm.Sender('AIzaSyC7gNVtZHM6iSE-NeQJk29zBaa3yG-dlG8');

	var registrationIds = [];

	message.addDataWithObject({
		test1: 'message1',
		test2: 'message2'
	});

	message.collapseKey = 'demo';

	message.delayWhileIdle = true;

	message.timeToLive = 3;


	pool.getConnection(function(err, connection){
		connection.query('select * from student where sno in (select sno from timetable where cno = ?)',[cno],function(err,rows){
			for(var index in rows){
				registrationIds.push(rows[index].rid);
			}
			sender.send(message, registrationIds, 4, function(err,result){
				if (err) throw err;
			});
		});
	});
}
