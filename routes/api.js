var express = require('express');
var router = express.Router(); //Express router is used to creat the api 
var Team = require('../models/team_model'); //Require the model for creating a team
var Player = require('../models/player_model'); //Require the model for creating a player
var Fixture = require('../models/fixture_model'); //Require the model for creating a fixture

var plTeams = ['Arsenal','Bournemouth','Brighton_and_Hove_Albion','Burnley',
			'Chelsea','Crystal_Palace','Everton','West_Ham_United','Huddersfield_Town',
			'Leicester_City','West_Bromwich_Albion','Liverpool','Manchester_City','Manchester_United',
			'Newcastle_United','Watford','Tottenham_Hotspur','Southampton','Swansea_City','Stoke_City'
			];

// Api returns all the fixtures in the database
router.get('/fixtures',function(req,res,next){
	Fixture.find().then(function(fixture){
		res.send(fixture);
	}).catch(next);
});

//returns team fixtures for whole season
//usage: api/fixtures/desired-team
router.get('/fixture/:team',function(req,res,next){
  Fixture.find({$or:[ 
        {'home.team':req.params.team}, 
        {'away.team':req.params.team}]}).then(function(fixture){
		res.send(fixture);
	}).catch(next);
});

//Api returns all the fixtures for a particular week in the database
router.get('/fixtures/:week',function(req,res,next){
	Fixture.find({'week':req.params.week}).then(function(fixture){
		res.send(fixture);
	});
});

//Api creates a new fixture into the database
router.post('/fixtures',function(req,res,next){
	Fixture.create(req.body).then(function(fixture){
		res.send(fixture);
	}).catch(next);
});

//Api searches 
router.put('/fixtures/:week/:team',function(req,res,next){
	Fixture.find({'week':req.params.week}).then(function(){
		Fixture.findOneAndUpdate({ $or:[ {'home.team':req.params.team}, {'away.team':req.params.team}]},req.body).
		then(function(fixture){
			res.send(fixture);
		});
	});
});

//returns team fixture for a particular week
//e.g: api/fixtures/2/Watford returns Watford v Bournemouth
router.get('/fixtures/:week/:team',function(req,res,next){  
  Fixture.find({ 
    $and:[ 
      {$or:[ 
        {'home.team':req.params.team}, 
        {'away.team':req.params.team}]}, 
      {'week':req.params.week}
    ]},req.body).
  then(function(fixture){
    res.send(fixture);
  });
});

//Api returns all the results for the specified week
router.get('/results/:week',function(req,res,next){
  var week = req.params.week;
  var results = [];

  function processFixture(fixture)
  {
    for(var w=1; w<=week; w++)
      for(f in fixture)
        if(fixture[f].week===w) 
          results.push(fixture[f]);
  }//processFixture
  
  Fixture.find().then(function(fixture){
    processFixture(fixture);
    res.send(results);
  }).catch(function(){console.log(err);}); 
});//get results/week


// router.delete()

// Api retrieves all the players in the database
router.get('/players',function(req,res,next){
	Player.find().then(function(player){
		res.send(player);
	}).catch(next);
});

// When Api is queried it finds a player that matches the query;
// eg '/players/?player=Mesut_Ozil'
// This would be useful for the player search bar
router.get('/players',function(req,res,next){
	Team.find({'name':req.query.player.replace(/\_/g,' ')}).then(function(player){
		res.send(player);
		console.log(req.query);
	}).catch(next);
});

// Api feteches a player, where :name is the player's name
// Api also searches for a player that belong to a particular team
router.get('/players/:name',function(req,res,next){
	for(var i=0; i<plTeams.length; i++){
		if(req.params.name === plTeams[i]){
			Player.find({'team':req.params.name.replace(/\_/g,' ')}).then(function(player){
				console.log(req.params);
				res.send(player);
			}).catch(next);
			break;
		}
	}
	if(req.params.name !== plTeams[i]){
		Player.findOne({'name':req.params.name.replace(/\_/g,' ')}).then(function(player){
				console.log(req.params);
				res.send(player);
			}).catch(next);
	}
});


// Api creates a new player to add to the database
router.post('/players',function(req,res,next){
	Player.create(req.body).then(function(team){
		res.send(team);
		console.log(req.body);
	}).catch(next);
});

// Api updates the content of a particular player
// Where :name is the players name
router.put('/players/:name',function(req,res,next){
	Player.findOneAndUpdate({'name':req.params.name.replace(/\_/g,' ')},req.body).then(function(player){
		res.send(player);
		console.log(req.params);
	}).catch(next);
});

// Api deletes a player where :name is the name of the player to be deleted
router.delete('/players/:name',function(req,res,next){
	Player.findOneAndRemove({'name':req.params.name.replace(/\_/g,' ')}).then(function(player){
		res.send(player);
		console.log(req.params);
	});
}) ;

// Api fetches all the teams in the database 
router.get('/teams',function(req,res,next){
	Team.find().sort('stats.position').then(function(team){
		res.send(team);
	}).catch(next);
});

// Api fetches the team that matches the value of the parameter :name"
router.get('/teams/:name',function(req,res,next){
	Team.findOne({'name':req.params.name.replace(/\_/g,' ')}).then(function(team){
		res.send(team);
	}).catch(next);
});

// calculates the rating for a team given the matches played
router.get('/team/:name/:rating',function(req,res,next){
    var rating;
	Team.findOne({'name':req.params.name.replace(/\_/g,' ')}).then(function(team){
      var stat = team.stats;
      rating = (10*stat.wins+5*stat.draws-7*stat.loss)+(7*stat.goals-6*stat.conceded)-(2*stat.yellowCard+4*stat.redCard);
      rating += stat.avgPos;
      rating /= stat.played;
      rating *= 100/25;
//      console.log(rating);
      res.send(rating);
	}).catch(next);
});

// Api adds a new team to the database
router.post('/teams',function(req,res,next){
	Team.create(req.body).then(function(team){
		res.send(team);
		console.log(req.body);
	}).catch(next);
	
});

// Api updates the content of the team that matches the value of parameter :name
router.put('/teams/:name',function(req,res,next){
	Team.findOneAndUpdate({'name':req.params.name.replace(/\_/g,' ')},req.body).then(function(){
		Team.findOne({'name':req.params.name.replace(/\_/g,' ')}).then(function(team){
			res.send(team);
			console.log(req.body);
			console.log(req.params);
		});
	}).catch(next);
});

// Api deletes the team that matches the team that matches the value of parameter :name
router.delete('/teams/:name',function(req,res,next){
	Team.findOneAndRemove({'name':req.params.name.replace(/\_/g,' ')}).then(function(team){
		res.send(team);
		console.log(req.params.name);
	}).catch(next);
});

module.exports = router;