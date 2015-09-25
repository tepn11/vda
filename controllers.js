var express = require('express');
var router = express.Router();
var fdb = require('./lib/fdb');

var fetchNameUrl = function(req, res) {
  var name_url = req.params.name_url;
  
  fdb.findByNameUrl([name_url], function(err, data){
    if(data.length>0){
      getPropertiesDetails(data[0].properties, function(prop){
        data[0].properties = prop;
        console.log(data);
        
        //return res.json({
        //  'success': true,
        //  'data': data
        //});
        return res.render('api', { title: 'API', data: data[0]});
      })
    } else {
      return res.status(404).render('error', { message: 'No data found for '+name_url });
    }
  });
}

var getPropertiesDetails = function(properties, callback){
  var properties = properties;
  var sub_prop = [];
  for (var value in properties){
    if(properties[value] === true){
      sub_prop.push(value);
    }
  }
  if(sub_prop.length>0){
    fdb.findByName(sub_prop, function(err, item){
      if(item.length>0){
        var waiting = 0;
        for (var i in item) {
          waiting++;
          properties[item[i].name] = item[i]
          if(item[i].properties){
            getPropertiesDetails(item[i].properties, function(prop){
              waiting--;
              properties[item[i].name].properties = prop;
              console.log(waiting);
              if(waiting == 0){
                  callback(properties);
              }
            })  
          }
        }
      } else {
          callback(properties);
      }
    });
  } else {
      callback(properties);
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:name_url?', fetchNameUrl);

module.exports = router;