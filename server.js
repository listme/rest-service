var http = require('http')
  , sqlite = require('sqlite3')
  , director = require('director'); 

var dbPath = __dirname + '/listme.db'
  , db = new sqlite.Database(dbPath)
  , router = new director.http.Router();

/**
 * # parametrize (obj) -> obj
 *
 * creates a variation of the object received by adding '$' at the beginning of
 * every property name so it can be passed as a placeholder supplier
 *
 * # params
 *
 * *   **obj:** `object`
 *
 * # usage
 * 
 *     parametrize({
 *       foo: 123,
 *       bar: 'abc'
 *     })
 *
 * returns
 *
 *     {
 *       $foo: 123,
 *       $bar: 'abc'
 *     }
 */
var parametrize = function (obj) {
  var ret = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      ret['$' + prop] = obj[prop];
    }
  }

  return ret;
};

/**
 * # getItem (id, callback)
 *
 * gets the content of the specified item and returns it to a callback
 *
 * # params
 *
 * *   **id:** `integer`
 * *   **callback:** `function (err, data)`
 *
 * # usage
 *
 *     getItem(5, function (err, data) {
 *       console.log(data);
 *     });
 */
var getItem = function (id, callback) {
  var sql = 'SELECT content FROM item WHERE id = ?';

  db.get(sql, id, function (err, row) {
    callback(err, row.content);
  });
};

/**
 * # setItem (item)
 *
 * saves/updates the content of the item received
 *
 * # params
 *
 * *   **item:**
 *
 *         {
 *          id: integer,
 *          content: text
 *         }
 *
 * if no `item.id` is supplied, a new item is created
 *
 * # usage
 *
 *     setItem({ id: 5, content: 'foo' });
 */
var setItem = function (item) {
  var sql = '';

  if (item.id) {
    sql = 'UPDATE item SET content = $content WHERE id = $id;'; 
  } else {
    sql = 'INSERT INTO item (content) VALUES ($content);';
  }

  db.run(sql, parametrize(item));
};

/**
 * # Server
 */

router.get('/id/:id', function (id) {
  var self = this;

  getItem(id, function (err, data) {
    if (err) {
      throw new Error(err);
    }

    self.res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    self.res.end(data);
  });
});

http.createServer(function (req, res) {
  router.dispatch(req, res, function (err) {
    if (err) {
      res.writeHead(404);
      res.end();
    }
  });
}).listen(8080);
