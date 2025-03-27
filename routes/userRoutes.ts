import {Router, Request, Response} from 'express';
import axios from 'axios';

const router = Router();

router.get('/home' , (req: Request, res: Response) => {
    res.status(200).json({message: "Hey Welcome where music is FREE!!"});
});

router.get('/placeholder' , async ( req: Request, res : Response) => {
    try{
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
        res.status(200).json(response.data);
    }
    catch(error)
    {
        res.status(500).json({ error: "Data fetch error!! "})
    }
});

export default router;