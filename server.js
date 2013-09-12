var sqlite3 = require('sqlite3')
  , dbPath = __dirname + '/listme.db'
  , db = new sqlite3.Database(dbPath);

/**
 * parametrize (obj) -> obj
 *
 * create a variation of the object received by adding '$' at the beginning of
 * every property name so it can be passed as a placeholder supplier
 *
 * Example: if an object like the following is passed to this function
 * 
 *    {
 *      foo: 123,
 *      bar: 'abc'
 *    }
 *
 * is returned a new object:
 *
 *    {
 *      $foo: 123,
 *      $bar: 'abc
 *    }
 */
var parametrize = function (obj) {
  var $obj = {};
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) $obj['$' + prop] = obj[prop];
  }

  return $obj;
};

/**
 * getItem (id)
 *
 * outputs the content of the item with the identifier received
 *
 * id: integer
 */
var getItem = function (id) {
  var sql = 'select content from item where id = ?';

  db.get(sql, id, function (err, row) {
    if (err) throw Error(err);
    console.log(row.content)
  });
};

/**
 * setItem (item)
 *
 * saves/updates the content of the item received
 *
 * item: {
 *  id: integer,
 *  content: text
 * }
 *
 * if no item.id is supplied, a new item is created
 */
var setItem = function (item) {
  var sql = '';

  if (item.id) sql = 'UPDATE item SET content = $content WHERE id = $id;'; 
  else sql = 'INSERT INTO item (content) VALUES ($content);';

  db.run(sql, parametrize(item));
};

// Examples
setItem({ id: 5, content: 'foo' });
getItem(5); // foo
setItem({ id: 5, content: 'bar' });
getItem(5); // bar