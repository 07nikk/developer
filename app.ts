import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes'
import youtubeRoutes from './routes/youtubeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//MIDDLEWARE
app.use(express.json());

//ROUTES
app.use('/api/v1' , userRoutes);
app.use('/api/v1/songsDownload', youtubeRoutes);

//SERVER START
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
});
