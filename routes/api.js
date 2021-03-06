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

// Api searches for the top players for a particular stats
router.get('/stats/:stat',function(req,res,next){
	var sort = 'stats.' + req.params.stat;
	Player.find().sort([[sort,'-1']]).then(function(player){
		res.send(player);
	});
});

// Api returns all the fixtures in the database
router.get('/fixtures',function(req,res,next){
	Fixture.find().sort('week').then(function(fixture){
		res.send(fixture);
	}).catch(next);
});

// returns either all the fixtures for a team /fixtures/Arsenal
// or returns fixtures for a particular week /fixtures/1
router.get('/fixtures/:team',function(req,res,next){
	for(var i=0; i<plTeams.length; i++){
		if(req.params.team === plTeams[i]){
			Fixture.find({$or:[ 
	        	{'home.team':req.params.team}, 
	        	{'away.team':req.params.team}]}).sort('week').then(function(fixture){
				res.send(fixture);
			}).catch(next);
	        break;
		}
	}
	if(req.params.team !== plTeams[i]){
		Fixture.find({'week':req.params.team}).then(function(fixture){
			res.send(fixture);
	});
	}

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
    ]}).
  then(function(fixture){
    res.send(fixture);
  });
});


//Api returns all the results from all the previous weeks
router.get('/results/:week',function(req,res,next){
	var results = [];
	for(let week=req.params.week; week>0; week--){
		Fixture.find({'week':week}).sort('week').then(function(fixture){
			results.push(fixture);
			if(week==1){
				res.send(results);	
			}
		});
	}
});

//Api creates a new fixture into the database
router.post('/fixtures',function(req,res,next){
	Fixture.create(req.body).then(function(fixture){
		res.send(fixture);
	}).catch(next);
});

//Api searches 
router.put('/fixtures/:week/:team',function(req,res,next){
	Fixture.findOneAndUpdate({
		$and:[
		{$or:[ 
        {'home.team':req.params.team}, 
        {'away.team':req.params.team}]}, 
		{'week':req.params.week}]},req.body).then(function(fixture){
			res.send(fixture);
	}).catch(next);
});


router.delete('/fixtures/:week/:team',function(req,res,next){
	Fixture.findOneAndRemove({
		$and:[
		{$or:[ 
        {'home.team':req.params.team}, 
        {'away.team':req.params.team}]}, 
		{'week':req.params.week}]}).then(function(fixture){
			res.send(fixture);
		}).catch(next);
});

// Api retrieves all the players in the database
router.get('/players',function(req,res,next){
	Player.find().sort('name').then(function(player){
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
			Player.find({'team.name':req.params.name.replace(/\_/g,' ')}).then(function(player){
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