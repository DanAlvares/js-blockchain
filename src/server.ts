import * as express from 'express';
import { Request, Response, NextFunction } from 'express';

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use('/api', router);

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
