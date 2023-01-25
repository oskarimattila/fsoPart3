const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
  {
    id: 1,
    name: "Ada Lovelace",
    number: "12345678"
  },
  {
    id: 2,
    name: "Arto Hellas",
    number: "123456789"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "123456789"
  }
]

const generateId = () => {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  return getRandomInt(1000)
}

app.get('/api/persons', (req, res)  => {
  res.json(persons)
})
app.get('/info', (req, res) => {
  const numberOfPersons = persons.length
  const time = Date()
  res.send(
    `
      <h1>Phonebook application<h1/>
      <h3>Phonebook has info for ${numberOfPersons} people<h3/>
      <h3>${time}<h3/>
    `
  )
})
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (!person) {
    return res.status(404).json({error: "person not found"})
  }
  else res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  console.log('DELETE person id', id)
  if (!persons.find(person => person.id === id)) return res.status(404).json({error: "person already deleted or does not exist"})
  persons = persons.filter(person => person.id != id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const id = generateId()
  const newPerson = req.body
  if (!newPerson.name || !newPerson.number) {
    return res.status(404).json({error: "content missing"})
  }
  if (persons.map(person => person.name.toLowerCase()).includes(newPerson.name.toLowerCase())) {
    return res.status(409).json({error: `${newPerson.name} already exists`})
  }
  newPerson.id = id
  persons = persons.concat(newPerson)
  console.log(JSON.stringify(newPerson))
  res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
