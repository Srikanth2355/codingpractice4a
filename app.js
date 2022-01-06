const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const startServerAndConnectToDb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running at port 3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

startServerAndConnectToDb();

const convertdbobjtoresponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get all players
app.get("/players/", async (request, response) => {
  const getplayerquery = `
    SELECT * FROM cricket_team;
    
    `;
  const playersarray = await db.all(getplayerquery);
  response.send(playersarray.map((player) => convertdbobjtoresponse(player)));
  //   response.send(
  //     playersarray.map((eachPlayer) => convertdbobjtoresponse(eachPlayer))
  //   );
});

//Add player to db
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const insertplayerquery = `
        INSERT INTO cricket_team(
        player_name,
        jersey_number,
        role)
        VALUES(
            '${playerName}',
            ${jerseyNumber},
           ' ${role}'
        );`;

  const addedplayer = await db.run(insertplayerquery);
  response.send("Player Added to Team");
});

//get particular player
app.get("/players/:playerid/", async (request, response) => {
  const { playerid } = request.params;
  const playerquery = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerid}`;

  const player = await db.get(playerquery);
  response.send(convertdbobjtoresponse(player));
});

//update player details using put
app.put("/players/:playerid", async (request, response) => {
  const { playerid } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const query = `
    UPDATE  cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerid};
    `;

  const playerupdate = await db.run(query);
  response.send("Player Details Updated");
});

// delete player
app.delete("/players/:playerid", async (request, response) => {
  const { playerid } = request.params;
  const query = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerid}
    `;
  const result = await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
