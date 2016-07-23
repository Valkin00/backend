var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,x-access-token, Accept");
  next();
});



favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._id})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
            if (err) return next(err);
            res.json(favorite);
        });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._id})
    .populate('postedBy')
    .populate('dishes')
    .exec(function (err, doc){
        if(doc)
        {
            console.log('Length is: ' + doc.dishes.length);
            var isIn = false;
            for (var i = 0; i < doc.dishes.length; i++)
            {
                console.log(doc.dishes[i]);
               // if(doc.dishes[i]._id == req.body.dish_id)
                if(doc.dishes[i] == req.body.dish_id)    
                {              
                    isIn = true;
                }
            }
            if(!isIn)
            {
                doc.dishes.push(req.body.dish_id);
                doc.save(function (err, d) {
                    if (err) return next(err);
                    console.log('Updated Favorites!');
                    res.json(d);
                });
            }
            else
            {
                
                res.end('Dish already exists in favorites');
            }
        }
        else
        {

            req.body.postedBy = req.decoded._id;
            req.body.dishes = [];
            req.body.dishes.push(req.body.dish_id);
          
            Favorites.create(req.body, function (err, favorite) {
                if (err) return next(err);
                if(favorite)
                {
                    console.log(favorite);
                }
                console.log('Favorite created!');
                var id = favorite._id;
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.end('Added the favorite with id: ' + id);
                console.log('ADDED ID: ' + id);
            });
        }
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        
    Favorites.remove({postedBy: req.decoded._id}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    
    Favorites.findOne({postedBy: req.decoded._id})
    .exec(function (err, favorite) {
        if (err) return next(err);
        var index = favorite.dishes.indexOf(req.params.dishId);
        if (index > -1) {
            favorite.dishes.splice(index, 1);
        }
        favorite.save(function (err, resp) {
            if (err) return next(err);
            res.json(resp);
        });
    });
    
    
});


module.exports = favoriteRouter;