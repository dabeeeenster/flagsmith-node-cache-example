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
    has: (key) => new Promise((resolve,reject)=>{
      redisClient.exists(key, (err, reply) => {
        console.log("check " + key + " from cache", err, reply);
        resolve(reply ===1)
      })
    }),
    get: (key) => new Promise((resolve)=>{
      redisClient.get(key, (err, cacheValue) => {
        console.log("get " + key + " from cache");
        resolve(cacheValue && JSON.parse(cacheValue))
      })
    }),
    set: (key, value) => new Promise((resolve)=>{
      redisClient.set(key, JSON.stringify(value), (err, reply) => {
        console.log("set " + key + " to cache", err);
        resolve()
      })
    }),
  }
});

router.get('/', function (req, res, next) {
  flagsmith.getValue('background_colour').then((value) => {
    res.render('index', {
      title: value
    });
  });
});

module.exports = router;
