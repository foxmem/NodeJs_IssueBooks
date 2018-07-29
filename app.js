const http = require('http');
const r = require('rethinkdb');
const hostname = '127.0.0.1';
const port = 8083;
const rethinkdb_host = 'localhost';

//me issue rethinkdb (8080,28115)
const rethinkdb_port = 28115;

//np issue rethinkdb (8181,28116)
//const rethinkdb_port = 28116;

const rethinkdb_db = 'IssueBooks';
const tb_issue = 'tb_issue';
const tb_classify = 'tb_classify';
const tb_user = 'tb_user';

const log = msg => {
  console.log(msg);
};

//rethinkdb service DataBase Service , such as Java 's Dao layer.
const rethinkdb = {
  db: null,
  conn: null,
  init: (host, port, db) => {
    rethinkdb.db = db;
    r.connect({host: host, port: port, db: db}, function (err, conn) {
      if (err) throw err;
      rethinkdb.conn = conn;
      log(`host:${host} and port:${port} and get a connection !`);
    });
  },
  _insert: (tb, arr,callback) => {
    r.table(tb).insert(arr).run(rethinkdb.conn, function (err, result) {
      if (err) {
        log(err);
        callback(false);
        return ;
      }
      console.log(JSON.stringify(result, null, 2));
      callback(true);
    });
  },
  _create_table: tb => {
    r.db(rethinkdb.db).tableCreate(tb).run(rethinkdb.conn, function (err, result) {
      if (err) {
        log(err);
        //throw err;
      }
      console.log(JSON.stringify(result, null, 2));
    });
  },
  _update_table: (tb, json ,callback) => {
    r.table(tb).update(json).run(rethinkdb.conn, function (err, result) {
      if (err) {
        log(err);
        //throw err;
        callback(false);
        return ;
      }
      console.log(JSON.stringify(result, null, 2));
      callback(true);
    });
  },
  _find_all: (tb, callback) => {
    r.table(tb).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
          //throw err;
        }
        log(`method:_find_all(table:${tb} callback) is ok`);
        callback(result);
      });
    });
  },
  _find_by_id: (tb, id, callback) => {
    r.table(tb).get(id).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
          //throw err;
        }
        log(`method:_find_by_id(table:${tb},id:${id} callback) is ok`);
        callback(result);
      });
    });
  },
  _detele: (tb,id,callback)=>{
    r.table(tb).get(id).delete().run(rethinkdb.conn, function (err, result) {
      if (err) {
        log(err);
        //throw err;
        callback(false);
        return ;
      }
      console.log(JSON.stringify(result, null, 2));
      callback(true);
    });
  },
  _login: (tb, info, callback) => {
    r.table(tb).filter(r.row('username').eq(info.username)).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
        callback([]);
        return;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
          //throw err;
          callback([]);
          return;
        }
        log(`method:_login(table:${tb},info(${JSON.stringify(info)}) callback) is ok`);
        callback(result);
      });
    });
  },
  //above is common function
  //next , we will need some specials query
  _classify_by_pid: (pid, callback) => {
    r.table(tb_classify).filter(r.row('pid').eq(pid)).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
        callback([]);
        return;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
          //throw err;
          callback([]);
          return;
        }
        log(`method:_classify_by_pid(pid:${pid} callback) is ok`);
        callback(result);
      });
    });
  },
  _issue_by_cid: (cid, callback) => {
    r.table(tb_issue).filter(r.row('classify_id').eq(cid)).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
        callback([]);
        return;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
          //throw err;
        }
        log(`method:_issue_by_cid(cid:${cid} callback) is ok`);
        callback(result);
      });
    });
  },
  _issue_count_by_cid: (callback) => {
    r.table(tb_classify).run(rethinkdb.conn, function (err, cursor) {
      if (err) {
        log(err);
        //throw err;
      }
      cursor.toArray(function (err, result) {
        if (err) {
          log(err);
        }
        log(`method:_issue_count_by_cid(callback) is ok`);

        let rel = [];
        let len = result.length;
        for (let o of result) {
          r.table(tb_issue).filter(r.row('classify_id').eq(o.id)).run(rethinkdb.conn, function (err, cursor) {
            if (err) log(err);
            cursor.toArray(function (err, result) {
              if (err) {
                log(err);
              }
              rel.push({id: o.id, num: result.length});
              len--;
              if (len === 0) {
                callback(rel);
              }
            });
          });
        }
      });
    });

  }
};
rethinkdb.init(rethinkdb_host, rethinkdb_port, rethinkdb_db);

const server = http.createServer((req, res) => {
  log('Server create success .....');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

server.on('request', (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', '*');
  response.setHeader('Access-Control-Allow-Credentials', true);
  // the same kind of magic happens here!
  //issueService.init(request,response);

  //It's important to note here that all headers are represented in lower-case only, 
  //regardless of how the client actually sent them. This simplifies the task of parsing headers for whatever purpose.
  //here , we need to explore url for different request path and paramters

  // by url , can get 'GET' request paramters.
  const {method, url} = request;

  //also can get request headers data , headers['xxxx'] 's xxx must lowcase.
  const {headers} = request;
  const userAgent = headers['user-agent'];

  //for POST or PUT ,you can't get paramters by url.
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //The chunk emitted in each 'data' event is a Buffer. 
  //If you know it's going to be string data, 
  //the best thing to do is collect the data in an array, then at the 'end', concatenate and stringify it.
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // at this point, `body` has the entire request body stored in it as a string
  });

  //An error in the request stream presents itself by emitting an 'error' event on the stream. 
  //If you don't have a listener for that event, the error will be thrown, which could crash your Node.js program.
  //  You should therefore add an 'error' listener on your request streams, even if you just log it and continue on your way.
  request.on('error', (err) => {
    // This prints the error message and stack trace to `stderr`.
    console.error(err.stack);
  });

  log(`Method:${method}`);
  log(`URL:${url}`);
  log(`Headers-UserAgent:${userAgent}`);
  log(`Headers-ContentType:${headers['contenttype']}`);

  //decode url
  let execPost = callback => {
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      callback(JSON.parse(body));
    });
  };
  switch (request.method) {
    case 'OPTIONS' :
      response.status(200).end();
      break;
    case 'POST' :
      execPost(data => {
        log(`request paramters : ${JSON.stringify(data)}`);
        let id = (new Date().getTime() - 1521097473817)+'';
        switch (request.url) {
            //User
          case '/user/login' :
            rethinkdb._login(tb_user, data, data => {
              log(`UserInfo:${JSON.stringify(data)}`);
              response.end(JSON.stringify(data));
            });
            break;
            //Classify
          case '/classify/add' :
            log("Add Classify:");
            log(data);
            id = parseInt(id.substring(0,7));
            data.id = id;
            data.pid = 0;
            data.has = true;
            data.create_date = new Date().getTime();
            rethinkdb._insert(tb_classify,data,status =>{
              response.end(""+status);
            });
            break;
          case '/classify/modify' :
            log("modify Classify:");
            log(data);
            rethinkdb._update_table(tb_classify,data,status =>{
              response.end(""+status);
            });
            break;
          case '/classify/delete' :
            log("delete Classify:");
            log(data);
            rethinkdb._detele(tb_classify,data.id,status =>{
              response.end(""+status);
            });
            break;
          case '/classify/fpid' :
            rethinkdb._classify_by_pid(data.id, arr => {
              log(`ClassifyArray:${JSON.stringify(arr)}`);
              response.end(JSON.stringify(arr));
            });
            break;
            //Issue
          case '/issue/fcid' :
            rethinkdb._issue_by_cid(data.id, arr => {
              log(`IssueArray:${JSON.stringify(arr)}`);
              response.end(JSON.stringify(arr));
            });
            break;
          case '/issue/add' :
            log("Add Issue:");
            log(data);
            id = parseInt(id.substring(0,7));
            data.id = id;
            data.classify_id = parseInt(data.classify_id);//将分类id重新设置成为整型数
            data.create_date = new Date().getTime();
            rethinkdb._insert(tb_issue,data,status =>{
              response.end(""+status);
            });
            break;
          case '/issue/update' :
            log("update Issue:");
            log(data);
            data.classify_id = parseInt(data.classify_id);//将分类id重新设置成为整型数
            rethinkdb._update_table(tb_issue,data,status =>{
              response.end(""+status);
            });
            break;
          case '/issue/delete' :
            log("delete Issue:");
            log(data);
            rethinkdb._detele(tb_issue,data.id,status =>{
              response.end(""+status);
            });
            break;
          case '/issue/count' :
            rethinkdb._issue_count_by_cid(data => {
              log(`CountInfo:${JSON.stringify(data)}`);
              response.end(JSON.stringify(data));
            });
            break;
          default :
            response.status(404).end();
            break;
        }
      });
      break;
    case 'GET' :
      response.end("Wellcome You Test GET Request ...");
      break;
    case 'DELETE' :
      break;
    default :
      response.end("Not Support Request ...");
      break;
  }
});
