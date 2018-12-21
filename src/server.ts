import * as express from 'express';
import * as bodyParser from 'body-parser';
import { BlockchainRoutes } from './routes';

const app = express();
const router = express.Router();

BlockchainRoutes(router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', router);

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

const port = process.argv[2] || 3000;

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
