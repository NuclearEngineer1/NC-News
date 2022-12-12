const {selectTopics} = require('./models')

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => { 
    res.send({ topics })
  })
}