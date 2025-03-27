import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//MIDDLEWARE
app.use(express.json());

//ROUTES
app.use('/api/v1' , userRoutes);

//SERVER START
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
});
