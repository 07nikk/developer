import { Router, Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import youtubedl from 'youtube-dl-exec';

const YtRouter = Router();

YtRouter.get('/download', async (req: Request, res: Response) => {
    const videoUrl = req.query.url as string;

    if(!videoUrl) {
        res.status(400).json({ error: 'please provide youtube video URL'});
    }

    try{
        console.log('Starting to download for: ', videoUrl);
        
        /** ---------- DO NOT REMOVE BELOW CODE--------- */
        // const outputDir = path.join(__dirname, '../downloads');
        // if(!fs.existsSync(outputDir)) {
        //     fs.mkdirSync(outputDir, { recursive: true });
        // }

        const outputDir = path.join(os.homedir(), 'Desktop');
        if(!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, {recursive: true});
        }
/**temp directory */
        // const tempDir = require('os').tmpdir();
        const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s'); //-----removing this can fix the issue
        // console.log('Output Path', outputPath);

        await youtubedl(videoUrl, {
            output: outputTemplate, //ENSURE CORRECT PATH
            format: 'bestaudio',
            mergeOutputFormat: 'mp4',
        });
/** Find the actual downloaded file in the directory*  */ 
        const files = fs.readdirSync(outputDir);
        const videoFile = files.find(file => file.endsWith('.webm'));

        if (!videoFile)
        {
            console.error(" Error: Downloaded file not found!!! ");
            res.status(500).json({ error: 'Download Failed, file missing'});
        }

        const outputPath = path.join(outputDir, videoFile as string);
        // const outputpath = path.join(outputDir, videoFile ?? 'default.mp4');
        console.log('✅ File downloaded:', outputPath);

/* SET RESPONSE HEADERS */
        res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', fs.statSync(outputPath).size); //download prompt
        res.setHeader('Cache-Control', 'no-store');

/** STREAM THE FILE TO THE CLIENT */
        const fileStream = fs.createReadStream(outputPath);
        fileStream.pipe(res);
        
        
        fileStream.on('end', () => {
            console.log('streaming complete');
            /**OPTIONALLY CAN DELETE THE FILE AFTER STREAMING -> fs.unlinksync(outputpath) */
            // fs.unlinkSync(outputPath);
        });

        fileStream.on('error', (err) => {
            console.error('❌ Stream error', err);
            res.status(500).json({ error: 'Error streaming video' });
        });

    }catch(error)
    {
        console.error( `Error downloading video: `, error);
        res.status(500).json({ error: 'Failed to download try again !!!'});
    }
});

export default YtRouter;

