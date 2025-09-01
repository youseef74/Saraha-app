import multer from "multer";
import fs from "fs";
import { fileTypes } from '../Common/Constants/files.constant.js';
import { allowedFileExtensions } from "../Common/Constants/files.constant.js";

function checkFolderExists(folderPath){
    console.log(`this is folder path :${folderPath}`);
    
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath,{recursive:true})
    }
}


export const localUpload = ({
    folderPath='sample',
    limits={}
})=>{
     
    const storage = multer.diskStorage({

        destination:(req,file,cb)=>{
            const filedir = `uploads/${folderPath}`
            checkFolderExists(filedir)
            cb(null,filedir)
        },
        filename:(req,file,cb)=>{
            console.log('this is file before uploading',file);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            
            cb(null,`${uniqueSuffix}__${file.originalname}`)
        }
    })
    
    const fileFilter = (req,file,cb)=>{
        const fileKey = file.mimetype.split('/')[0].toUpperCase(); // IMAGE
        const fileType = fileTypes[fileKey]; // "image"
        
        console.log(fileType);
        
        if(!fileType){cb(new Error('Invalid file type'),false)}

        const fileExtension = "." + file.mimetype.split('/')[1].toLowerCase(); // ".jpeg"
console.log({fileExtension, extensions: allowedFileExtensions[fileKey]});

if (!allowedFileExtensions[fileKey].includes(fileExtension)) {
    return cb(new Error('Invalid file extension'), false);
}

        cb(null,true)
        

    }

    return multer({
        limits,
        storage,
        fileFilter})
}
export const hostUpload = ({
    
    limits={}
})=>{
     
    const storage = multer.diskStorage({})
    
    const fileFilter = (req,file,cb)=>{
        const fileKey = file.mimetype.split('/')[0].toUpperCase(); // IMAGE
        const fileType = fileTypes[fileKey]; // "image"
        
        console.log(fileType);
        
        if(!fileType){cb(new Error('Invalid file type'),false)}

        const fileExtension = "." + file.mimetype.split('/')[1].toLowerCase(); // ".jpeg"
console.log({fileExtension, extensions: allowedFileExtensions[fileKey]});

if (!allowedFileExtensions[fileKey].includes(fileExtension)) {
    return cb(new Error('Invalid file extension'), false);
}

        cb(null,true)
        

    }

    return multer({
        limits,
        storage,
        fileFilter})
}