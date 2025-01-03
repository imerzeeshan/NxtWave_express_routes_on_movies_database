const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

//Initializing database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server Running at Port 3000`)
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//Get movies API
app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
  SELECT 
    * 
  FROM 
    movie 
  ORDER BY 
    movie_id;`
  const movieArray = await db.all(getAllMoviesQuery)
  const ans = movie => {
    return {
      // movieId: movie.movie_id,
      // directorId: movie.director_id,
      movieName: movie.movie_name,
      // leadActor: movie.lead_actor,
    }
  }
  response.send(movieArray.map(eachMovie => ans(eachMovie)))
})

//Add new movie API
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get Particular Movie by ID
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
    * 
  FROM  
    movie 
  WHERE 
    movie_id = ${movieId};`
  const singleMovie = await db.get(getMovieQuery)

  const movie = {
    movieId: singleMovie.movie_id,
    directorId: singleMovie.director_id,
    movieName: singleMovie.movie_name,
    leadActor: singleMovie.lead_actor,
  }

  response.send(movie)
})

//Update Movie API
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {movieName, directorId, leadActor} = request.body
  const updateMovieQuery = `
  UPDATE 
    movie 
  SET 
    movie_name = '${movieName}',
    director_id = ${directorId},
    lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId};
    `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
    movie 
  WHERE 
    movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get all Directors List API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`
  const directorArray = await db.all(getDirectorsQuery)
  const ans = director => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    }
  }
  response.send(directorArray.map(eachDirector => ans(eachDirector)))
})

//Get movie Directors API
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  // console.log(request.params)
  const getDirectorMovieQuery = `
  SELECT
    *
  FROM  
    movie
  WHERE 
    director_id = ${directorId};`

  const directorMovieArray = await db.all(getDirectorMovieQuery)
  const ans = movie => {
    return {
      movieName: movie.movie_name,
    }
  }
  response.send(directorMovieArray.map(eachMovie => ans(eachMovie)))
})

module.exports = app
