const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(console.log('connected to MongoDB'))
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const validateNumber = (number) => {
  const validNumber = /\d{2,3}[-]\d{6,8}/
  return validNumber.test(number)
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3
    
  },
  number: {
    type: String,
    required: true,
    validate: validateNumber,
    minLength: 8,
    maxLength: 12
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
