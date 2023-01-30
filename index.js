const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/api/persons', (req, res)  => {
  Person.find({}).then(people => {
    res.json(people)
  })
})
app.get('/info', (req, res) => {
  const time = Date()
  Person.find({}).then(people => {
    const numberOfPersons = people.length
    res.send(
      `
        <h1>Phonebook application<h1/>
        <h3>Phonebook has info for ${numberOfPersons} people<h3/>
        <h3>${time}<h3/>
      `
    )
  })
})
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (!person) {
        return res.status(404).json({error: 'person not found'})
      }
      else res.json(person)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(person => {
      if (!person) return res.status(404).json({error: 'person not found'})
      else res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const {name, number} = req.body
  const person = {
    name: name,
    number: number
  }
  Person.findByIdAndUpdate(
    req.params.id,
    person,
    {new: true, runValidators: true, context: 'query'}
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
