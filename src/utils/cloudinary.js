import { v2 as cloudinary } from "cloudinary";

import dotenv from 'dotenv'

dotenv.config({ path: './.env' }); // Load environment variables from.env file



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (fileBuffer, fileName) => {
    try {
        if (!fileBuffer) {
            return null;
        }

        // Convert buffer to base64 string
        const base64Image = fileBuffer.toString('base64');
        const mimeType = 'image/jpeg'; // Adjust if necessary based on your file type

        // Upload the file on Cloudinary
        console.log(`Trying to upload file`);

        const response = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Image}`, {
            resource_type: "auto",
            public_id: fileName // Optional: you can specify a unique public ID for the file
        });

        console.log(`Successful upload of file`);
        return response;
    } catch (error) {
        console.log('Error', error);
        return null;
    }
}

export { uploadOnCloudinary };
