import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

import getAISummaryRoute from './routes/getAISummary.js'
app.use(getAISummaryRoute);


app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
