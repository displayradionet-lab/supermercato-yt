import express from "express";
import multer from 'multer';
import streamifier from 'streamifier';
import auth from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });  
        }

        // 🟢 Funzione di Upload tramite Stream (Zero chiamate a fs o readFile)
        const streamUpload = (fileBuffer: Buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'supermercato-yt',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                // Converte il Buffer in uno Stream leggibile e lo invia a Cloudinary
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        // Eseguiamo l'upload in modo asincrono
        const result: any = await streamUpload(req.file.buffer);

        return res.json({ url: result.secure_url });
    } catch (error: any) {
        console.error("❌ Errore durante l'upload su Cloudinary:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

export default uploadRouter;