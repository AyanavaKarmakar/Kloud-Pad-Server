const express = require('express');
const connectToMongo = require("./database");
var cors = require('cors');

connectToMongo();

const app = express()
const port = 5000


app.use(cors());
app.use(express.json());

// available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
    res.send('Hey, you. You are finally awake.');
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})