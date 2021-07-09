var express = require('express');
var router = express.Router();
const flagsmith = require('flagsmith-nodejs');
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

flagsmith.init({
  environmentID: 'Go7k4WG2XzjZnzQsuZPoci',
  cache: {
    has: (key) => redisClient.exists(key, (err, reply) => {
      console.log("check " + key + " from cache with reply " + reply);
      return (reply === 1)
    }),
    get: (key) => redisClient.get(key, (err, cacheValue) => {
      console.log("get " + key + " from cache");
      return cacheValue
    }),
    set: (key, value) => redisClient.set(key, value, (err, reply) => {
      console.log("set " + key + " from cache");
    }),
  }
});

router.get('/', function (req, res, next) {
  flags = flagsmith.getFlags();

  flagsmith.getValue('background_colour').then((value) => {
    res.render('index', {
      title: value
    });
  });
});

function getFlags(key) {
  redisClient.get(key, (err, cacheValue) => {
    if (err) throw err;

    if (cacheValue) {
      console.log(key + " found in cache");
      return cacheValue
    } else {
      console.log(key + " *not* found in cache");
      flagsmith.getValue(key).then((value) => {
        redisClient.set(key, value, (err, reply) => {
          if (err) throw err;
        });
      });
    }
  });
}

module.exports = router;