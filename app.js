const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const intialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB error ${e.message}`);

    prosess.exit(1);
  }
};

intialize();

const convertMoviesObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;

  const moviesArray = await db.all(getMoviesQuery);

  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
     *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMoviesObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const api2 = `
     INSERT INTO
     movie (director_id,movie_name,lead_actor) 
     VALUES 
     (
          ${directorId},
         '${movieName}',
         '${leadActor}');`;
  const db3 = await db.run(api2);

  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE 
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;

  const directorArray = await db.all(getDirectorsQuery);

  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMovieQuery = `
    SELECT 
    movie_name
    FROM
    movie
    WHERE
    director_id = ${directorId};`;

  const moviesArray = await db.all(getDirectorMovieQuery);

  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;