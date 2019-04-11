const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { random } = require('lodash');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const { read: readData } = require('./dht-reader');

// Express middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.origins(['*:*', 'http://localhost:3001']);

MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	server.listen(9000);

	app.get('/', (req, resp) => {
	  resp.send('Hello, world!');
	});

	app.get('/sensor_data', (req, res) => {
		db.collection('sensor_data').find({
		 	 _id: {
				 // Верни данные за последние 24 часа
				$gt: ObjectID.createFromTime(Date.now() / 1000 - 1*60*60)
	 		}
		}).toArray((error, result) => {
			if (error) res.send({ error });
			else res.send(result); 
		});
	});

	io.on('connection', socket => {
	  const sensorInterval = setInterval(async () => {
	     	const data = await readData();  
		socket.emit('sensor', data);
		db.collection('sensor_data').insert(data);
	  }, 60000);

	  socket.on('disconnect', reason => {
	    if (reason === 'io client disconnect') {
		clearInterval(sensorInterval);
		db.close();
	    } 
	  })
	});
});
