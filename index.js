const express = require('express');
const path = require('path');
const NBA = require('nba');
const bodyParser = require('body-parser');
const fs = require('fs');

const player_id = JSON.parse(fs.readFileSync('allPlayerid.json', 'utf8'));
const activePlayers = JSON.parse(fs.readFileSync('activePlayers.json', 'utf8'));

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(bodyParser.text());

app.post('/api/nba', (req, res) => {

	var factType = Math.floor(Math.random() * 6);

	switch(factType){
		case 0 : 
			console.log('Team Historical Fact');
			var team = getRandomTeam();

			getTeamHistoricalLeaders(team, res);
			break;

		case 1 : 
			console.log('Player Splits Fact');

			var player = getRandomActivePlayer();
			getRandomPlayerSeason(player.playerId).then(function(season){
			//	NBA.stats.playerSplits({PlayerID: 1627749, Season: season}).then(function(data, error){
			//		if(!error) res.json(data);
			//		else res.status(400).send(error);
			//	});
				getPlayerSplitsFact(player, season, res);
			});

			break;

		case 2 :
			console.log('Player Profile Fact');
			var playerid = getRandomPlayer();

			getPlayerProfile(playerid, res);
			break;

		case 3 :
			console.log('Team Season Ranking');
		    var team = getRandomTeam();

		    getTeamSeasonRankings(team, res);

			break;

		case 4 :
			console.log('Team Splits Fact');
			//teamSplits does not have data before 1996
		    var team = getRandomTeam();
		    var season = getRandomSeasonForSplits();

		    getTeamSplitsFact(team, season, res);
			
			break;

		case 5 :
			console.log('Team Common Fact');
			var team = getRandomTeam();
			getRandomTeamSeason(team).then(function(season){
				NBA.stats.commonTeamRoster({TeamID : team, Season: season}).then(function(data, error){
					getCommonTeamStats(data, team, season, res);
				});		
			});
			break;

		case 6 :
			console.log('Player Info Fact');
			var player = getRandomPlayer();

			getPlayerInfo(player, res);

			break;

		case 7 :
			var team = getRandomTeam();
			getRandomTeamSeason(team).then(function(season){
				NBA.stats.playerStats({TeamID : team, Season: season}).then(function(data, error){

					if(!error) res.json(data);
					else res.status(400).send(error);
				});		
			});
			break;

		case 8 :
			NBA.stats.teamClutch({
				TeamID : '1610612739', 
				Season: '2016-17', 
				AheadBehind: 'Behind or Tied', 
				ClutchTime: 'Last 30 Seconds',
				PointDiff: '5'
			}).then(function(data, error){
				if(!error) res.json(data);
				else res.status(400).send(error);
			});
			break;

		case 9 :
			NBA.stats.playerClutch({
				TeamID : '1610612739', 
				Season: '2016-17', 
				AheadBehind: 'Behind or Tied', 
				ClutchTime: 'Last 30 Seconds',
				PointDiff: '5'
			}).then(function(data, error){
				if(!error) res.json(data);
				else res.status(400).send(error);
			});
			break;

		case 10 :
			NBA.stats.playerShooting({TeamID : '1610612739', Season: '2016-17'}).then(function(data, error){
				if(!error) res.json(data);
				else res.status(400).send(error);
			});
			break;
	}
});

function getTeamSplitsFact(team, season, res){
	var teamFact = Math.floor(Math.random() * 4);

	switch(teamFact){

	case 0: 
		getTeamRoadVsHome(team, season, res);
		break;
	case 1:
		getTeamWinVsLosses(team, season, res);
		break;
	case 2:
		getTeamPrePostAllStar(team, season, res);
		break;
	case 3:
		getTeamBtbVsRest(team, season, res);
		break;

	}
}

function getPlayerSplitsFact(player, season, res){
	var playerFact = Math.floor(Math.random() * 4);

	switch(playerFact){

		case 0:
			getPlayerBtbVsRest(player, season, res);
			break;
		case 1:
			getPlayerRoadVsHome(player, season, res);
			break;
		case 2:
			getPlayerWinVsLosses(player, season, res);
			break;
		case 3:
			getPlayerPrePostAllStar(player, season, res);
			break;
	}
}

function getRandomPlayerSeason(playerid){
	return new Promise(function(resolve, reject){
		NBA.stats.playerInfo({PlayerID: playerid }).then(function(data, error){
			var index = Math.floor(Math.random() * data.availableSeasons.length);
			if(!error) resolve (formatSeason(data.availableSeasons[index].seasonId));
			else reject (error);
		});
	});
}

function getPlayerInfo(playerid, res){
	NBA.stats.playerInfo({PlayerID: playerid }).then(function(data, error){
		if(!error) res.send(data);
		else res.status(400).send(error);
	});
}

function getCommonTeamStats(data, team, season, res){
	var teamData = data.commonTeamRoster;
	var numPlayers = data.commonTeamRoster.length;

	var ranStat = Math.floor(Math.random() * 6);

	var stats = [];

	switch(ranStat){

		case 0:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].weight);
			}

			var heaviestWeight = Math.max(...stats);
			var heaviestWeightPlayer = teamData[stats.indexOf(heaviestWeight.toString())];

			var fact = getBKrefURLPlayer(heaviestWeightPlayer.player) + ' was the heaviest player for the ' + season + ' ' + team[1] + ' at ' + 
					   heaviestWeight + ' lbs'; 
			break;

		case 1:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].weight);
			}

			var lightestWeight = Math.min(...stats);
			var lightestWeightPlayer = teamData[stats.indexOf(lightestWeight.toString())];

			var fact = getBKrefURLPlayer(lightestWeightPlayer.player) + ' was the lightest player for the ' + season + ' ' + team[1] + ' at ' + 
					   lightestWeight + ' lbs'; 
			break;

		case 2:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].height);
			}		

			var originalStats = stats.slice();
			var sortedStats = sortHeight(stats);

			var tallestHeight = sortedStats[numPlayers-1];
			var tallestHeightPlayer = teamData[originalStats.indexOf(tallestHeight)];

			var fact = getBKrefURLPlayer(tallestHeightPlayer.player) + ' was the tallest player for the ' + season + ' ' + team[1] + ' at ' + 
					   tallestHeight; 	
			break;

		case 3:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].height);
			}		

			var originalStats = stats.slice();
			var sortedStats = sortHeight(stats);

			var shortestHeight = sortedStats[0];
			var shortestHeightPlayer = teamData[originalStats.indexOf(shortestHeight)];

			var fact = getBKrefURLPlayer(shortestHeightPlayer.player) + ' was the shortest player for the ' + season + ' ' + team[1] + ' at ' + 
					   shortestHeight; 	
			break;

		case 4:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].age);
			}

			var oldestAge = Math.max(...stats);
			var oldestAgePlayer = teamData[stats.indexOf(oldestAge)];

			var fact = getBKrefURLPlayer(oldestAgePlayer.player) + ' was the oldest player for the ' + season + ' ' + team[1] + ' at ' + 
					   oldestAge + ' years old'; 
			break;

		case 5:

			for(var i=0;i<numPlayers;i++){
				stats.push(teamData[i].age);
			}

			var youngestAge = Math.min(...stats);
			var youngestAgePlayer = teamData[stats.indexOf(youngestAge)];

			var fact = getBKrefURLPlayer(youngestAgePlayer.player) + ' was the youngest player for the ' + season + ' ' + team[1] + ' at ' + 
					   youngestAge + ' years old'; 
			break;
	} 

	res.send(fact);
}

function getTeamHistoricalLeaders(team, res){
	NBA.stats.teamHistoricalLeaders({ TeamID : team[0], SeasonID: '42016' }).then(function(data, error){
		var teamLeaders = data.careerLeadersByTeam[0];
		var ptsLeader = teamLeaders.ptsPlayer;
		var stlLeader = teamLeaders.stlPlayer;
		var astLeader = teamLeaders.astPlayer;
		var blkLeader = teamLeaders.blkPlayer;
		var rebLeader = teamLeaders.rebPlayer;

		var ranLeader = Math.floor(Math.random() * 5);
		var fact = '';

		switch(ranLeader){
			case 0: 
				fact = getBKrefURLPlayer(teamLeaders.ptsPlayer) + ' is the leader in points scored for the ' + team[1] + ' with ' + teamLeaders.pts + ' points';
				break;

			case 1:
				fact = getBKrefURLPlayer(teamLeaders.stlPlayer) + ' is the leader in steals for the ' + team[1] + ' with ' + teamLeaders.stl + ' steals';
				break;

			case 2:
				fact = getBKrefURLPlayer(teamLeaders.astPlayer) + ' is the leader in assists for the ' + team[1] + ' with ' + teamLeaders.ast + ' assists';
				break;

			case 3:
				fact = getBKrefURLPlayer(teamLeaders.rebPlayer) + ' is the leader in rebounds for the ' + team[1] + ' with ' + teamLeaders.reb + ' rebounds';
				break;

			case 4:
				fact = getBKrefURLPlayer(teamLeaders.blkPlayer) + ' is the leader in blocks for the ' + team[1] + ' with ' + teamLeaders.blk + ' blocks';
				break;
		}

		if(!error) 
		res.send(fact);
		else res.status(400).send(error);
	});
}

function getPlayerBtbVsRest(player, season, res){
	NBA.stats.playerSplits({PlayerID: player.playerId, Season: season}).then(function(data, error){

		if(data.daysRestPlayerDashboard.length !== 0 || data.daysRestPlayerDashboard[0].groupValue !== '0 Days Rest'){
			var playerRest = data.daysRestPlayerDashboard;

			var fact = 'In the ' + season + ' season, ' + getBKrefURLPlayer(player.firstName + ' ' + player.lastName);
			var factType = Math.floor(Math.random() * 8);
			var zeroDaysRest = playerRest[0];

			var restGP = 0;
			for(var i=1;i<playerRest.length;i++)
				restGP += playerRest[i].gp;

			switch(factType){

				case 0:
					fact = handleRestScoring(playerRest, restGP, zeroDaysRest, fact);
					break;

				case 1:
					fact = handleRestAssist(playerRest, restGP, zeroDaysRest, fact);
					break;

				case 2:
				 	fact = handleRestTov(playerRest, restGP, zeroDaysRest, fact);
				 	break;

				case 3:
					fact = handleRestFt(playerRest, restGP, zeroDaysRest, fact);
				 	break;

				case 4:
					fact = handleRestReb(playerRest, restGP, zeroDaysRest, fact);
				 	break;

				case 5:
				 	fact = handleRestPf(playerRest, restGP, zeroDaysRest, fact);
				 	break;

				case 6:
				 	fact = handleRestStl(playerRest, restGP, zeroDaysRest, fact);
				 	break;

				case 7:
			 		fact = handleRestBlk(playerRest, restGP, zeroDaysRest, fact);
			 		break;

			}

			if(!error) res.send(fact);
			else res.status(400).send(error);

		} else getPlayerBtbVsRest(getRandomActivePlayer(), '2016-17', res);
	
	});
}

function getPlayerPrePostAllStar(player, season, res){
	NBA.stats.playerSplits({PlayerID: player.playerId, Season: season}).then(function(data, error){

		if(data.prePostAllStarPlayerDashboard[1]){

			var stats = data.prePostAllStarPlayerDashboard;

			var fact = 'In the ' + season + ' season, ' + getBKrefURLPlayer(player.firstName + ' ' + player.lastName);
			var factType = Math.floor(Math.random() * 8);

			switch(factType){

				case 0:
					fact = handleShootingSplits(stats, 'allstar', fact);
					break;

				case 1:
					fact = handleAstSplits(stats, 'allstar', fact);
					break;

				case 2:
				 	fact = handleTovSplits(stats, 'allstar', fact);
				 	break;

				case 3:
					fact = handleFtSplits(stats, 'allstar', fact);
				 	break;

				case 4:
					fact = handleRebSplits(stats, 'allstar', fact);
				 	break;

				case 5:
				 	fact = handlePfSplits(stats, 'allstar', fact);
				 	break;

				case 6:
				 	fact = handleStlSplits(stats, 'allstar', fact);
				 	break;

				case 7:
				 	fact = handleBlkSplits(stats, 'allstar', fact);
				 	break;
			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		} else getPlayerPrePostAllStar(getRandomActivePlayer(), '2016-17', res);

	});
}

function getPlayerWinVsLosses(player, season, res){
	NBA.stats.playerSplits({PlayerID : player.playerId, Season: season}).then(function(data, error){

		if(data.winsLossesPlayerDashboard.length !== 0){

		var fact = 'In the ' + season + ' season, ' + getBKrefURLPlayer(player.firstName + ' ' + player.lastName);

		var factType = Math.floor(Math.random() * 8);

		var stats = data.winsLossesPlayerDashboard;

		switch(factType){

			case 0:
				fact = handleShootingSplits(stats, 'record', fact);
				break;

			case 1:
				fact = handleAstSplits(stats, 'record', fact);
				break;

			case 2:
			 	fact = handleTovSplits(stats, 'record', fact);
			 	break;

			case 3:
				fact = handleFtSplits(stats, 'record', fact);
			 	break;

			case 4:
			 	fact = handleRebSplits(stats, 'record', fact);
			 	break;

			case 5:
			 	fact = handlePfSplits(stats, 'record', fact);
			 	break;

			case 6:
				fact = handleStlSplits(stats, 'record', fact);
			 	break;

			case 7:
			 	fact = handleBlkSplits(stats, 'record', fact);
			 	break;
		}

		if(!error) res.send(fact);
		else res.status(400).send(error);
	} else getPlayerWinVsLosses(getRandomActivePlayer(), '2016-17', res);
	});
}

function getPlayerRoadVsHome(player, season, res){
	NBA.stats.playerSplits({PlayerID : player.playerId, Season: season}).then(function(data, error){

		if(data.locationPlayerDashboard.length !== 0){

			var fact = 'In the ' + season + ' season, ' + getBKrefURLPlayer(player.firstName + ' ' + player.lastName);
			var factType = Math.floor(Math.random() * 8);

			var stats = data.locationPlayerDashboard;

			switch(factType){

				case 0:
					fact = handleShootingSplits(stats, 'location', fact);
					break;

				case 1:
					fact = handleAstSplits(stats, 'location', fact);
					break;

				case 2:
				 	fact = handleTovSplits(stats, 'location', fact);
				 	break;

				case 3:
				 	fact = handleFtSplits(stats, 'location', fact);
				 	break;

				case 4:
				 	fact = handleRebSplits(stats, 'location', fact);
				 	break;

				case 5:
					fact = handlePfSplits(stats, 'location', fact);
				 	break;

				case 6:
				 	fact = handleStlSplits(stats, 'location', fact);
				 	break;

				case 7:
				 	fact = handleBlkSplits(stats, 'location', fact);
				 	break;
			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		} else getPlayerRoadVsHome(getRandomActivePlayer(), '2016-17', res);
	});
}


function getTeamBtbVsRest(team, season, res){
	NBA.stats.teamSplits({TeamID: team, Season: season}).then(function(data, error){

		if(data.daysRestTeamDashboard.length !== 0){
			var teamRest = data.daysRestTeamDashboard;

			var fact = 'The ' + getBKrefURLTeam(season + ' ' + team[1]);
			var factType = Math.floor(Math.random() * 9);
			var zeroDaysRest = teamRest[0];

			var restGP = 0;
			for(var i=1;i<teamRest.length;i++)
				restGP += teamRest[i].gp;

			switch(factType){

				case 0:
					fact = handleRestTeamWinLose(teamRest, restGP, zeroDaysRest, fact);
					break;

				case 1:
					fact = handleRestScoring(teamRest, restGP, zeroDaysRest, fact);
					break;

				case 2:
					fact = handleRestAssist(teamRest, restGP, zeroDaysRest, fact);
					break;

				case 3:
				 	fact = handleRestTov(teamRest, restGP, zeroDaysRest, fact);
				 	break;

				case 4:
					fact = handleRestFt(teamRest, restGP, zeroDaysRest, fact);
				 	break;

				case 5:
					fact = handleRestReb(teamRest, restGP, zeroDaysRest, fact);
				 	break;

				case 6:
					fact = handleRestPf(teamRest, restGP, zeroDaysRest, fact);
				 	break;

				case 7:
				 	fact = handleRestStl(teamRest, restGP, zeroDaysRest, fact);
				 	break;

				case 8:
				 	fact = handleRestBlk(teamRest, restGP, zeroDaysRest, fact);
				 	break;
			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		} else getTeamBtbVsRest(getRandomTeam(), getRandomSeasonForSplits(), res);
	
	});
}

function getTeamPrePostAllStar(team, season, res){
	NBA.stats.teamSplits({TeamID: team, Season: season}).then(function(data, error){

		if(data.prePostAllStarTeamDashboard[0].groupValue !== 'N/A'){

			var stats = data.prePostAllStarTeamDashboard;

			var fact = 'The ' + getBKrefURLTeam(season + ' ' + team[1]);
			var factType = Math.floor(Math.random() * 9);

			switch(factType){
				case 0:
					fact = handleRecordSplits(stats, 'allstar', fact);
					break;

				case 1:
					fact = handleShootingSplits(stats, 'allstar', fact);
					break;

				case 2:
					fact = handleAstSplits(stats, 'allstar', fact);
					break;

				case 3:
				 	fact = handleTovSplits(stats, 'allstar', fact);
				 	break;

				case 4:
					fact = handleFtSplits(stats, 'allstar', fact);
				 	break;

				case 5:
					fact = handleRebSplits(stats, 'allstar', fact);
				 	break;

				case 6:
				 	fact = handlePfSplits(stats, 'allstar', fact);
				 	break;

				case 7:
				 	fact = handleStlSplits(stats, 'allstar', fact);
				 	break;

				case 8:
				 	fact = handleBlkSplits(stats, 'allstar', fact);
				 	break;
			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		} else getTeamPrePostAllStar(getRandomTeam(), getRandomSeasonForSplits(), res);

	});
}

function getTeamWinVsLosses(team, season, res){
	NBA.stats.teamSplits({TeamID : team, Season: season}).then(function(data, error){

		var fact = 'The ' + getBKrefURLTeam(season + ' ' + team[1]) + ' (' + data.overallTeamDashboard[0].w 
		            + '-' + data.overallTeamDashboard[0].l +')';
		var factType = Math.floor(Math.random() * 8);

		var stats = data.winsLossesTeamDashboard;

		switch(factType){

			case 0:
				fact = handleShootingSplits(stats, 'record', fact);
				break;

			case 1:
				fact = handleAstSplits(stats, 'record', fact);
				break;

			case 2:
			 	fact = handleTovSplits(stats, 'record', fact);
			 	break;

			case 3:
				fact = handleShootingSplits(stats, 'record', fact);
			 	break;

			case 4:
			 	fact = handleRebSplits(stats, 'record', fact);
			 	break;

			case 5:
			 	fact = handlePfSplits(stats, 'record', fact);
			 	break;

			case 6:
				fact = handleStlSplits(stats, 'record', fact);
			 	break;

			case 7:
			 	fact = handleBlkSplits(stats, 'record', fact);
			 	break;
		}

		if(!error) res.send(fact);
		else res.status(400).send(error);
	});
}

function getTeamRoadVsHome(team, season, res){
	NBA.stats.teamSplits({TeamID : team, Season: season}).then(function(data, error){

		if(data.locationTeamDashboard.length !== 0){

			var fact = 'The ' + getBKrefURLTeam(season + ' ' + team[1]);
			var factType = Math.floor(Math.random() * 9);

			var stats = data.locationTeamDashboard;

			switch(factType){

				case 0:
					fact = handleRecordSplits(stats, 'location', fact);
					break;

				case 1:
					fact = handleShootingSplits(stats, 'location', fact);
					break;

				case 2:
					fact = handleAstSplits(stats, 'location', fact);
					break;

				case 3:
				 	fact = handleTovSplits(stats, 'location', fact);
				 	break;

				 case 4:
				 	fact = handleFtSplits(stats, 'location', fact);
				 	break;

				 case 5:
				 	fact = handleRebSplits(stats, 'location', fact);
				 	break;

				 case 6:
					fact = handlePfSplits(stats, 'location', fact);
				 	break;

				 case 7:
				 	fact = handleStlSplits(stats, 'location', fact);
				 	break;

				 case 8:
				 	fact = handleBlkSplits(stats, 'location', fact);
				 	break;
			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		} else getTeamRoadVsHome(team, '2016-17', res);
	});
}

function getTeamSeasonRankings(teamid, res){
	getRandomTeamSeason(teamid).then(function(season){
		NBA.stats.teamInfoCommon({TeamID: teamid, Season: season}).then(function(data, error){

			var teamCity = data.teamInfoCommon[0].teamCity;
			var teamName = data.teamInfoCommon[0].teamName;

			var factType = Math.floor(Math.random() * 5);
			var fact = 'The ' + getBKrefURLTeam(season + ' ' + teamCity + ' ' + teamName) + ' were ranked ';

			switch(factType){

				case 0: 
					var ptsRank = data.teamSeasonRanks[0].ptsRank;
					var ptsPg = data.teamSeasonRanks[0].ptsPg;

					fact += ptsRank + ' in points per game with ' + ptsPg + ' ppg';
					break;

				case 1:
					var rebRank = data.teamSeasonRanks[0].rebRank;
					var rebPg = data.teamSeasonRanks[0].rebPg;

					fact += rebRank + ' in rebounds per game with ' + rebPg + ' rpg';
					break;

				case 2:
					var astRank = data.teamSeasonRanks[0].astRank;
					var astPg = data.teamSeasonRanks[0].astPg;

					fact += astRank + ' in assists per game with ' + astPg + ' apg';
					break;


				case 3:
					var oppPtsRank = data.teamSeasonRanks[0].oppPtsRank;
					var oppPtsPg = data.teamSeasonRanks[0].oppPtsPg;

					fact += oppPtsRank + ' in points allowed per game with ' + oppPtsPg + ' ppg';
					break;

				case 4:
					var wins = data.teamInfoCommon[0].w;
					var loses = data.teamInfoCommon[0].l;
					var confRank = data.teamInfoCommon[0].confRank;
					var teamConference = data.teamInfoCommon[0].teamConference

					fact += confRank + ' in the ' + teamConference + ' with a record of ' + wins + '-' + loses;
					break;

			}

			if(!error) res.send(fact);
			else res.status(400).send(error);
		});			
	});
}

//todo refactor so that it checks for data exists before getting playerName
function getPlayerProfile(playerid, res){

	getPlayerName(playerid).then(function(playerName){
		NBA.stats.playerProfile({PlayerID: playerid}).then(function(data, error){
			var playerFact = Math.floor(Math.random() * 5);

			switch(playerFact){
				case 0:
					getPlayerRegularSeasonAvgs(data, playerName, res);
					break;
				case 1:
					getPlayerCareerSeasonAvgs(data, playerName, res);
					break;
				case 2:
					getPlayerCareerHighAvgs(data, playerName, res);
					break;
				case 3:
					getPlayerSeasonPostSeasonAvgs(data, playerName, res);
					break;
				case 4:
					getPlayerCareerAllStarAvgs(data, playerName, res);
					break;
			}

		});
	});
}

function getPlayerRegularSeasonAvgs(data, playerName, res){

	if(data.seasonTotalsRegularSeason.length !== 0){

		var seasonAverages = data.seasonTotalsRegularSeason[Math.floor(Math.random() * data.seasonTotalsRegularSeason.length)];

		var season = seasonAverages.seasonId;
		var points = seasonAverages.pts;
		var rebounds = seasonAverages.reb;
		var assists = seasonAverages.ast;
		var team = abbrevTeam(seasonAverages.teamAbbreviation); 
		var minPlayed = seasonAverages.min;
		var fgPct = seasonAverages.fgPct;
		var fg3Pct = seasonAverages.fg3Pct;
		var ftPct = seasonAverages.ftPct;

		var fact = 'For the '+ getBKrefURLTeam(season + ' ' + (team !== 0 ? team: '')) + ', ' + getBKrefURLPlayer(playerName)
			+ ' averaged ' + points + ' pts, ' + (rebounds !== null ? rebounds : 0) + ' reb, and '
			+ assists + ' ast with ' + Math.round(fgPct * 100) + '/' + Math.round(fg3Pct * 100) + '/' + Math.round(ftPct * 100) 
			+ ' shooting splits' + (minPlayed !== null ? (' while playing ' + minPlayed + ' mins per game') : '');

		if(team == 'TOT') fact = fact.split(' for')[0];

		res.send(fact);

	} else getPlayerProfile(getRandomPlayer(), res);
}

function getPlayerCareerSeasonAvgs(data, playerName, res){

	if(data.careerTotalsRegularSeason.length !== 0){

		var careerAverages = data.careerTotalsRegularSeason[0];

		var points = careerAverages.pts;
		var rebounds = careerAverages.reb;
		var assists = careerAverages.ast;

		var fact = 'For his career, ' + getBKrefURLPlayer(playerName)
			+ ' has averaged ' + points + ' pts, ' + rebounds + ' reb, and '
			+ assists + ' ast';

		res.send(fact);

	} else getPlayerProfile(getRandomPlayer(), res);
}

function getPlayerCareerPostSeasonAvgs(data, playerName, res){
	if(data.careerTotalsPostSeason.length !== 0){

		var careerPostSeasonAverages = data.careerTotalsPostSeason[0];
	
		var gamesPlayed = careerPostSeasonAverages.gp;
		var minPlayed = careerPostSeasonAverages.min;
		var fgPct = careerPostSeasonAverages.fgPct;
		var fg3Pct = careerPostSeasonAverages.fg3Pct;
		var ftPct = careerPostSeasonAverages.ftPct;
		var rebounds = careerPostSeasonAverages.reb;
		var assists = careerPostSeasonAverages.ast;
		var points = careerPostSeasonAverages.pts;

		var fact = 'In ' + gamesPlayed + ' career playoff ' + (gamesPlayed !== 1 ? 'games' : 'game') + ', ' 
			+ getBKrefURLPlayer(playerName) + ' has averaged ' + points + ' pts, ' + (rebounds !== null ? rebounds : 0) + ' reb, and '
			+ assists + ' ast with ' + Math.round(fgPct * 100) + '/' 
			+ Math.round(fg3Pct * 100) + '/' + Math.round(ftPct * 100) 
			+ ' shooting splits while playing ' + minPlayed + ' mins per game';

		res.send(fact);

	} else getPlayerProfile(getRandomPlayer(), res);
}

function getPlayerSeasonPostSeasonAvgs(data, playerName, res){

	if(data.seasonTotalsPostSeason.length !== 0){

		var seasonPostSeasonAverages = data.seasonTotalsPostSeason[Math.floor(Math.random() * data.seasonTotalsPostSeason.length)];

		var season = seasonPostSeasonAverages.seasonId;
		var points = seasonPostSeasonAverages.pts;
		var rebounds = seasonPostSeasonAverages.reb;
		var assists = seasonPostSeasonAverages.ast;
		var team = abbrevTeam(seasonPostSeasonAverages.teamAbbreviation); 
		var minPlayed = seasonPostSeasonAverages.min;
		var fgPct = seasonPostSeasonAverages.fgPct;
		var fg3Pct = seasonPostSeasonAverages.fg3Pct;
		var ftPct = seasonPostSeasonAverages.ftPct;

		var fact = 'In the '+ getBKrefURLTeam(season + ' ' + (team !== 0 ? team: '')) + ' post season, ' + getBKrefURLPlayer(playerName)
			+ ' averaged ' + points + ' pts, ' + (rebounds !== null ? rebounds : 0) + ' reb, and '
			+ assists + ' ast with ' + Math.round(fgPct * 100) + '/' + Math.round(fg3Pct * 100) + '/' + Math.round(ftPct * 100) 
			+ ' shooting splits' + (minPlayed !== null ? (' while playing ' + minPlayed + ' mins per game') : '');

		res.send(fact);

	} else getPlayerProfile(getRandomPlayer(), res);
}

function getPlayerCareerHighAvgs(data, playerName, res){

	var careerHighs = data.careerHighs[Math.floor(Math.random() * data.careerHighs.length)];

	if(careerHighs.gameDate !== ''){

		var stat = careerHighs.stat;
		var statValue = careerHighs.statValue;
		var gameDate = careerHighs.gameDate;
		var vsTeamName = careerHighs.vsTeamName;
		var vsTeamCity = careerHighs.vsTeamCity;

		var fact = 'On ' + gameDate + ', ' + getBKrefURLPlayer(playerName)
			+ ' had a career high of ' + statValue + ' ' + stat + ' against the '
			+ vsTeamCity + ' ' + vsTeamName;

		res.send(fact);

	} else getPlayerProfile(getRandomPlayer(), res);
}

function getPlayerCareerAllStarAvgs(data, playerName, res){

	if(data.careerTotalsAllStarSeason.length !== 0){

		var allStarAvgs = data.careerTotalsAllStarSeason[0];

		var gp = allStarAvgs.gp;
		var points = allStarAvgs.pts;
		var rebounds = allStarAvgs.reb;
		var assists = allStarAvgs.ast;
		var team = abbrevTeam(allStarAvgs.teamAbbreviation); 
		var minPlayed = allStarAvgs.min;
		var fgPct = allStarAvgs.fgPct;
		var fg3Pct = allStarAvgs.fg3Pct;
		var ftPct = allStarAvgs.ftPct;

		var fact = 'In '+ gp + ' all star games, ' + getBKrefURLPlayer(playerName)
			+ ' averaged ' + points + ' pts, ' + (rebounds !== null ? rebounds : 0) + ' reb, and '
			+ assists + ' ast with ' + Math.round(fgPct * 100) + '/' + Math.round(fg3Pct * 100) + '/' + Math.round(ftPct * 100) 
			+ ' shooting splits' + (minPlayed !== null ? (' while playing ' + minPlayed + ' mins per game') : '');

		res.send(fact); 

	} else getPlayerProfile(getRandomPlayer(), res);
}

//todo: check for team names and cities for certain years (Brooklyn and New Jersey Nets)
function getRandomTeam(){
	const teamList = [
		[1610612737, 'Atlanta Hawks'], [1610612738, 'Boston Celtics'], [1610612739, 'Cleveland Cavaliers'], 
		[1610612740, 'New Orleans Pelicans'], [1610612741, 'Chicago Bulls'], [1610612742, 'Dallas Mavericks'], 
		[1610612743, 'Denver Nuggets'], [1610612744, 'Golden State Warriors'], [1610612745, 'Houston Rockets'], 
		[1610612746, 'Los Angeles Clippers'], [1610612747, 'Los Angeles Lakers'], [1610612748, 'Miami Heat'],
		[1610612749, 'Milwaukee Bucks'], [1610612750, 'Minnesota Timberwolves'], [1610612751, 'Brooklyn Nets'], 
		[1610612752, 'New York Knicks'], [1610612753, 'Orlando Magic'], [1610612754, 'Indiana Pacers'], 
		[1610612755, 'Philadelphia 76ers'], [1610612756, 'Phoenix Suns'], [1610612757, 'Portland Trailblazers'], 
		[1610612758, 'Sacramento Kings'], [1610612759, 'San Antonio Spurs'], [1610612760, 'Oklahoma City Thunder'], 
		[1610612761, 'Toronto Raptors'], [1610612762, 'Utah Jazz'], [1610612763, 'Memphis Grizzlies'], 
		[1610612764, 'Washington Wizards'], [1610612765, 'Detroit Pistons'], [1610612766, 'Charlotte Hornets']
	];

	return teamList[Math.floor(Math.random() * 30)];
}

function abbrevTeam(teamAbbreviation){
	const teamNames = {
		'LAL' : 'Los Angeles Lakers', 'LAC' : 'Los Angeles Clippers', 'NYK' : 'New York Knicks',
		'HOU' : 'Houston Rockets', 'TOR' : 'Toronto Raptors', 'SAS' : 'San Antonio Spurs',
		'CHA' : 'Charlotte Hornets', 'WAS' : 'Washington Wizards', 'PHI' : 'Philadelphia 76ers',
		'ATL' : 'Atlanta Hawks', 'NOP' : 'New Orleans Pelicans', 'ORL' : 'Orlando Magic',
		'DET' : 'Detroit Pistons', 'MEM' : 'Memphis Grizzlies', 'OKC' : 'Oklahoma City Thunder',
		'DEN' : 'Denver Nuggets', 'MIN' : 'Minnesota Timberwolves', 'STL' : 'St. Louis Hawks',
		'SYR' : 'Syracuse Nationals', 'POR' : 'Portland Trail Blazers', 'MIL' : 'Milwaukee Bucks',
		'PHX' : 'Phoenix Suns', 'IND' : 'Indiana Pacers', 'CLE' : 'Cleveland Cavaliers',
		'BOS' : 'Boston Celtics', 'CHI' : 'Chicago Bulls', 'BKN' : 'Brooklyn Nets',
		'GSW' : 'Golden State Warriors', 'SDR' : 'San Diego Rockets', 'NJN' : 'New Jersey Nets',
		'SAC' : 'Sacramento Kings', 'KCK' : 'Kansas City Kings', 'SAN' : 'San Antonio Spurs',
		'PRO' : 'Providence Steam Rollers', 'SEA' : 'Seattle Supersonics', 'PHL' : 'Philadelphia 76ers',
		'DAL' : 'Dallas Mavericks', 'MIH' : 'Milwaukee Hawks', 'UTH' : 'Utah Jazz',
		'NOH' : 'New Orleans Hornets', 'MNL' : 'Minnesota Lakers', 'ROC' : 'Rochester Royals',
		'BLT' : 'Baltimore Bullets', 'WAT' : 'Waterloo Hawks', 'BUF' : 'Buffalo Braves',
		'BAL' : 'Baltimore Bullets', 'SDC' : 'San Diego Clippers', 'HUS' : 'Toronto Huskies',
		'PHW' : 'Philadelphia Warriors', 'GOS' : 'Golden State Warriors', 'SFW' : 'San Francisco Warriors',
		'MIA' : 'Miami Heat', 'CHH' : 'Charlotte Hornets', 'TCB' : 'Tri-Cities Blackhawks',
		'UTA' : 'Utah Jazz', 'FTW' : 'Fort Wayne Pistons', 'INO' : 'Indianapolis Olympians',
		'CIN' : 'Cincinnati Royals', 'CHP' : 'Chicago Packers', 'DEF' : 'Detroit Falcons',
		'BOM' : 'St. Louis Bombers',
		'TOT' : 'Season'
	}

	return teamNames[teamAbbreviation];
}

function getPlayerName(playerid){
	return new Promise(function(resolve, reject){
		NBA.stats.playerInfo({PlayerID: playerid }).then(function(data, error){
			if(!error) resolve (data.commonPlayerInfo[0].displayFirstLast);
			else reject (error);
		});
	});
}

function getRandomPlayer(){
	var index = Math.floor(Math.random() * 4297) + 1;
	return player_id[0][index];
}

function getRandomActivePlayer(){
	var index = Math.floor(Math.random() * activePlayers.length);
	return activePlayers[index];
}

function getRandomTeamSeason(team){
	return new Promise(function(resolve, reject){
		NBA.stats.teamInfoCommon({TeamID: team}).then(function(data, error){
			var ranNum = Math.floor(Math.random() * data.availableSeasons.length);
			var seasonID = data.availableSeasons[ranNum].seasonId;

			resolve(formatSeason(seasonID));

		});
	});
}

//formatting seasonID (22016) into acceptable season parameter (2016-17)
function formatSeason(season){
	season = season.slice(1,5);

	if(!(season == '1999')) var yearAfter = parseInt(season.slice(2, 4)) + 1;	
	else var yearAfter = 00;

	yearAfter = yearAfter.toString();

	if(yearAfter.length == 2) season = season + '-' + yearAfter;
	else season = season + '-0' + yearAfter;

	return season;
}

function getRandomSeasonForSplits(){
	const seasonList = [
		'1996-97', '1997-98', '1998-99', '1999-00', '2001-02', '2002-03', 
		'2003-04', '2004-05', '2005-06', '2006-07', '2007-08', '2008-09',
		'2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15', 
		'2015-16', '2016-17'
	];

	return seasonList[Math.floor(Math.random() * 20)];	
}

function handleRestScoring(statsRest, restGP, zeroDaysRest, fact){
	var restFgPct = 0, restFga = 0, restFgm = 0;
	var restFtPct = 0, restFta = 0, restFtm = 0;
	var rest3Pct = 0, rest3pa = 0, rest3pm = 0;
	var restPts = 0;

	for(var i=1;i<statsRest.length;i++){
		restFga += statsRest[i].fga * statsRest[i].gp;
		restFgm += statsRest[i].fgm * statsRest[i].gp;
		restFta += statsRest[i].fta * statsRest[i].gp;
		restFtm += statsRest[i].ftm * statsRest[i].gp;
		rest3pa += statsRest[i].fG3A * statsRest[i].gp;
		rest3pm += statsRest[i].fG3M * statsRest[i].gp;
		restPts += statsRest[i].pts * statsRest[i].gp;
	}

	restFgPct = restFgm / restFga;
	restFtPct = restFtm / restFta;
	rest3Pct = rest3pm / rest3pa;
	restPts = restPts / restGP;

	var btbFgPct = zeroDaysRest.fgPct;
	var btbFtPct = zeroDaysRest.ftPct;
	var btb3Pct = zeroDaysRest.fg3Pct;
	var btbPts = zeroDaysRest.pts;

	fact += ' scored '+ btbPts + ' ppg with shooting splits of ' + Math.round(btbFgPct * 100) + '/' + Math.round(btb3Pct * 100)
		 + '/' + Math.round(btbFtPct * 100) + ' on 0 days rest and scored ' + restPts.toFixed(1) + ' ppg with shooting splits of ' + Math.round(restFgPct * 100)
		 + '/' + Math.round(rest3Pct * 100) + '/' + Math.round(restFtPct * 100) + ' on 1+ days of rest';

	return fact;
}

function handleRestAssist(statsRest, restGP, zeroDaysRest, fact){
	var btbAst = zeroDaysRest.ast;
	var restAst = 0;

	for(var i=1;i<statsRest.length;i++)
		restAst += statsRest[i].ast * statsRest[i].gp;
	restAst = restAst / restGP;

	fact += ' averaged ' + btbAst + ' assists per game on 0 days rest and ' + restAst.toFixed(1) + ' assists on 1+ days rest';

	return fact;
}

function handleRestTov(statsRest, restGP, zeroDaysRest, fact){
	var btbTov = zeroDaysRest.tov;
	var restTov = 0;

	for(var i=1;i<statsRest.length;i++)
		restTov += statsRest[i].tov * statsRest[i].gp;
	restTov = restTov / restGP;

	fact += ' gave up ' + btbTov + ' turnovers per game on 0 days rest and ' + restTov.toFixed(1) + ' turnovers in games on 1+ days rest';

	return fact;
}

function handleRestFt(statsRest, restGP, zeroDaysRest, fact){
	var btbFta = zeroDaysRest.fta;
	var btbFtm = zeroDaysRest.ftm;
	var btbFtPct = zeroDaysRest.ftPct;

	var restFtPct = 0, restFta = 0, restFtm = 0;

	for(var i=1;i<statsRest.length;i++){
		restFta += statsRest[i].fta * statsRest[i].gp;
		restFtm += statsRest[i].ftm * statsRest[i].gp;
	}

	restFtPct = restFtm / restFta;
	restFta = restFta / restGP;
	restFtm = restFtm / restGP;

	fact += ' averaged ' + btbFtm + '/' + btbFta + ' free throws (' + Math.floor(btbFtPct * 100)
		 + '%) on 0 days rest and shot ' + restFtm.toFixed(1) + '/' + restFta.toFixed(1) + ' (' + Math.floor(restFtPct * 100)
		 + '%) on 1+ days rest';	

	return fact;
}

function handleRestReb(statsRest, restGP, zeroDaysRest, fact){
	var btbReb = zeroDaysRest.reb;
	var restReb = 0;

	for(var i=1;i<statsRest.length;i++)
		restReb += statsRest[i].reb * statsRest[i].gp;
	restReb = restReb / restGP;

	fact += ' grabbed ' + btbReb + ' rebounds per game on 0 days rest and ' + restReb.toFixed(1) 
		 + ' rebounds on 1+ days rest';	

	return fact;
}

function handleRestPf(statsRest, restGP, zeroDaysRest, fact){
	var btbPf = zeroDaysRest.pf;
	var restPf = 0;

	for(var i=1;i<statsRest.length;i++)
		restPf += statsRest[i].pf * statsRest[i].gp;
	restPf = restPf / restGP;

	fact += ' committed ' + btbPf + ' fouls per game on 0 days rest and ' + restPf.toFixed(1) + ' fouls on 1+ days rest';

	return fact;
}

function handleRestStl(statsRest, restGP, zeroDaysRest, fact){
	var btbStl = zeroDaysRest.stl;
	var restStl = 0;

	for(var i=1;i<statsRest.length;i++)
		restStl += statsRest[i].stl * statsRest[i].gp;
	restStl = restStl / restGP;

	fact += ' averaged ' + btbStl + ' steals per game on 0 days rest and ' + restStl.toFixed(1) + ' steals on 1+ days rest';
	return fact;
}

function handleRestBlk(statsRest, restGP, zeroDaysRest, fact){
	var btbBlk = zeroDaysRest.blk;
	var restBlk = 0;

	for(var i=1;i<statsRest.length;i++)
		restBlk += statsRest[i].blk * statsRest[i].gp;
	restBlk = restBlk / restGP;

	fact += ' averaged ' + btbBlk + ' blocks per game on 0 days rest and ' + restBlk.toFixed(1) + ' blocks on 1+ days rset';
	return fact;
}

function handleRestTeamWinLose(statsRest, restGP, zeroDaysRest, fact){
	
  	var restWin = 0, restLose = 0, restPlusMinus = 0;

	for(var i=1;i<statsRest.length;i++){
		restWin += statsRest[i].w;
		restLose += statsRest[i].l;
		restPlusMinus += statsRest[i].plusMinus * statsRest[i].gp;
	}

	restPlusMinus = restPlusMinus / restGP;

	var btbWin = zeroDaysRest.w;
	var btbLose = zeroDaysRest.l;
	var btbPlusMinus = zeroDaysRest.plusMinus;

	fact += ' had a ' + btbWin + '-' + btbLose 
		 + ' record with a point differential of ' + btbPlusMinus + ' on 0 days rest and a ' + restWin + '-' + restLose
	     + ' record with a point differential of ' + restPlusMinus.toFixed(1) + ' on 1+ days rest';

	return fact;
}

function handleRecordSplits(stats, factType, fact){
	var preWin = stats[0].w;
	var preLose = stats[0].l;
	var prePlusMinus = stats[0].plusMinus;

	var postWin = stats[1].w;
	var postLose = stats[1].l;
	var postPlusMinus = stats[1].plusMinus;

	var factString = getFactString(factType);

	fact += ' had a ' + preWin + '-' + preLose 
		 + ' record with a point differential of ' + prePlusMinus + factString[0] + ' and a ' + postWin + '-' + postLose
		 + ' record with a point differential of ' + postPlusMinus + factString[1];

	return fact;
}

function handleShootingSplits(stats, factType, fact){
	var preFgPct = stats[0].fgPct;
	var preFtPct = stats[0].ftPct;
	var pre3Pct = stats[0].fg3Pct;
	var prePts = stats[0].pts;

	var postFgPct = stats[1].fgPct;
	var postFtPct = stats[1].ftPct;
	var post3Pct = stats[1].fg3Pct;
	var postPts = stats[1].pts;

	var factString = getFactString(factType);

	fact += ' scored '+ prePts + ' ppg with shooting splits of ' + Math.round(preFgPct * 100) + '/' + Math.round(pre3Pct * 100)
		 + '/' + Math.round(preFtPct * 100) + factString[0] + ' and scored ' + postPts + ' ppg with shooting splits of ' + Math.round(postFgPct * 100)
	     + '/' + Math.round(post3Pct * 100) + '/' + Math.round(postFtPct * 100) + factString[1];
	
	return fact;
}

function handleAstSplits(stats, factType, fact){
	var preAst = stats[0].ast;
	var postAst = stats[1].ast;

	var factString = getFactString(factType);

	fact += ' averaged ' + preAst + ' assists per game' + factString[0] + ' and ' + postAst + ' assists' + factString[1];
	
	return fact;
}


function handleTovSplits(stats, factType, fact){
	var preTov = stats[0].tov;
 	var postTov = stats[1].tov;

 	var factString = getFactString(factType);

	fact += ' gave up ' + preTov + ' turnovers per game' + factString[0] + ' and ' + postTov + ' turnovers in games' + factString[1];
	
	return fact;
}

function handleFtSplits(stats, factType, fact){
	var preFta = stats[0].fta;
	var preFtm = stats[0].ftm;
	var preFtPct = stats[0].ftPct;

	var postFta = stats[1].fta;
	var postFtm = stats[1].ftm;
	var postFtPct = stats[1].ftPct;

	var factString = getFactString(factType);

	fact += ' averaged ' + preFtm + '/' + preFta + ' free throws (' + Math.floor(preFtPct * 100)
		 + '%)' + factString[0] + ' and shot ' + postFtm + '/' + postFta + ' (' + Math.floor(postFtPct * 100)
		 + '%)' + factString[1];	

	return fact;
}

function handleRebSplits(stats, factType, fact){
	var preReb = stats[0].reb;
	var postReb = stats[1].reb;

	var factString = getFactString(factType);

	fact += ' grabbed ' + preReb + ' rebounds per game' + factString[0] + ' and ' + postReb 
		 + ' rebounds per game' + factString[1];

	return fact;
}

function handlePfSplits(stats, factType, fact){
	var prePf = stats[0].pf;
	var postPf = stats[1].pf;

	var factString = getFactString(factType);

	fact += ' committed ' + prePf + ' fouls per game' + factString[0] + ' and ' + postPf + ' fouls per game' + factString[1];

	return fact;	
}

function handleStlSplits(stats, factType, fact){
	var preStl = stats[0].stl;
	var postStl = stats[1].stl;

	var factString = getFactString(factType);

	fact += ' averaged ' + preStl + ' steals per game' + factString[0] + ' and ' + postStl + ' steals' + factString[1];

	return fact;
}

function handleBlkSplits(stats, factType, fact){
	var preBlk = stats[0].blk;
	var postBlk = stats[1].blk;

	var factString = getFactString(factType);

	fact += ' averaged ' + preBlk + ' blocks per game' + factString[0] + ' and ' + postBlk + ' blocks' + factString[1];

	return fact;
}

function getFactString(factType){
	var comparedFactOne = '';
	var comparedFactTwo = '';

	if(factType === 'allstar'){
		comparedFactOne = ' Pre All-Star break';
		comparedFactTwo = ' Post All-Star break';
	} else if (factType === 'record'){
		comparedFactOne = ' in wins';
		comparedFactTwo = ' in losses';
	} else if (factType === 'location'){
		comparedFactOne = ' at home';
		comparedFactTwo = ' on the road';
	}

	return [comparedFactOne, comparedFactTwo];
}

function sortHeight(heights){

	heights.sort(function(a,b){
		var heightA = a.split('-');
		var feetA = heightA[0];
		var inchesA = heightA[1];

		var heightB = b.split('-');
		var feetB = heightB[0];
		var inchesB = heightB[1];

		if (feetA === feetB){
			return parseInt(inchesA) - parseInt(inchesB)
		} else return parseInt(feetA) - parseInt(feetB)
	})

	return heights;
}

function getBKrefURLPlayer(query){
	var url = '<a target="_blank" href="https://www.basketball-reference.com/search/search.fcgi?search=' + 
		query + '">' + query + '</a>';
	console.log(query);
	return url;
}

function getBKrefURLTeam(query){
	var team = query.split('-');
	var team = (parseInt(team[0]) + 1) + ' ' + team[1].slice(2);
	var url = '<a target="_blank" href="https://www.basketball-reference.com/search/search.fcgi?search=' + 
		team + '">' + query + '</a>';
	console.log(query);
	return url;	
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`App listening on ${port}`);


