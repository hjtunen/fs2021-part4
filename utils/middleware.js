const logger = require("./logger")
const morgan = require("morgan")
const jwt = require("jsonwebtoken")

morgan.token("body", function (request, response) { return JSON.stringify(request.body)}) /* eslint-disable-line no-unused-vars */
const requestLogger = morgan(":method :url :status :res[content-length] - :response-time ms :body")

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token"
    })
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired"
    })
  }


  next(error)
}

const tokenExtractor = (request, response, next) => {
  // tokenin ekstraktoiva koodi
  const authorization = request.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7)
  }else {
    request.token = null
  }

  next()
}

const userExtractor = (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    response.status(401).json({ error: "token missing or invalid" })
  }

  request.user = decodedToken

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}