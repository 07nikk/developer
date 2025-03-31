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

        /** SET OUTPUT DIRECTORY */
        const outputDir = path.join(os.homedir(), 'Desktop');
        if(!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, {recursive: true});
        }

        /** SET OUTPUT TEMPLATE WITH `.m4a` EXTENSION */
        const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');


        await youtubedl(videoUrl, {
            output: outputTemplate.replace('%(ext)s', 'm4a'), //ENSURE CORRECT PATH
            format: 'bestaudio',
            noPart: true,
            noOverwrites: true,
        });

        /** Find the actual downloaded file in the directory*  */ 
        const files = fs.readdirSync(outputDir);
        const videoFile = files.find(file => file.endsWith('.m4a') || file.endsWith('.webm'));

        /** CHECK IF THE AUDIO FILE IS PRESENT OR NOT */
        if (!videoFile)
        {
            console.error(" Error: Downloaded file not found!!! ");
            res.status(500).json({ error: 'Download Failed, file missing'});
            return; // can add error middleware
        }

        const outputPath = path.join(outputDir, videoFile as string);
        console.log('✅ File downloaded:', outputPath);

        console.log("video URL with name maybe ",videoFile as string);

        /**CONVERT TO MP3 USING FFMG */
        const mp3FileName = path.basename(videoFile as string, path.extname(videoFile as string) + '.mp3');
        const mp3FilePath = path.join(outputDir, mp3FileName);
        
        // console.log('🎵 Converting to MP3:', mp3FilePath);
        console.log('✅ MP3 file created:', mp3FilePath);

        /* SET RESPONSE HEADERS */
        res.setHeader('Content-Disposition', `attachment; filename=${mp3FileName}.mp3`); /** FILE NAME CAN BE SET FROM HERE */
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', fs.statSync(mp3FilePath).size); //download prompt
        res.setHeader('Cache-Control', 'no-store');


        /** STREAM THE FILE TO THE CLIENT */
        const fileStream = fs.createReadStream(mp3FilePath);
        fileStream.pipe(res);
        
        
        fileStream.on('end', () => {
            console.log('streaming complete');
            /**OPTIONALLY CAN DELETE THE FILE AFTER STREAMING -> fs.unlinksync(outputpath) */
            fs.unlinkSync(outputPath);
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

