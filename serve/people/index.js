var cwd = central.cwd;
var User = require(cwd + '/models/user').User;
var Interest = require(cwd + '/models/interest').Interest;

var utils = require('../utils');

module.exports = function(app, central) {
  var tasks = require(central.cwd + '/tasks');

  app.get(/^(\/api)?\/people\/\w+$/, function(req, res, next) {
    return res.redirect(301, req._parsedUrl.pathname + '/');
  });
  app.get(/^(\/api)?\/people\/(\w+)\/.*$/, utils.getUser({
    fn: function(req) { return req.params[1]; }
  }), function(req, res, next) {
    var people = res.data.people;
    var uid = req.params[1]; 
    if (people && uid === people.id && people.uid) {
      return res.redirect(301, '/people/' + people.uid + '/');
    }
    next();
  });

  app.get('/people/:uid/', function(req, res, next) {
    if (!res.data || !res.data.people || res.data.people.invalid == 'NO_USER') {
      res.statusCode = 404;
      return res.render('people/404');
    }

    var people = res.data.people;
    var sleep = false;
    var recount = 'recount' in req.query;
    if (!people.stats_p || recount) {
      //try compute the results
      tasks.compute({
        user: people,
        force: recount
      });
      sleep = true;
    }
    setTimeout(function() {
      if (recount) {
        res.redirect(req._parsedUrl.pathname);
      } else {
        res.render('people', res.data);
      }
    }, sleep ? 70 : 0);
  }); 

  app.get('/people/:uid/books', function(req, res, next) {
    Interest.findByUser('book', people.uid, function(err, data) {
      c.err = err;
      c.interests = {
        book: data
      };
      res.render('people/interests', c);
    }, {
      reversed: true,
      attach_subject: true
    });
  });
};
