import {v2 as cloudinary} from "cloudinary"

console.log(
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFileCloudinary = async(file,options)=>{
    const result = await cloudinary.uploader.upload(file,{
        folder: "profiles",       
        width: 512,              
        height: 512,
        crop: "fill"
    })
    return result
}

export const uploadManyFileCloudinary = async (files)=>{
    const result= []
    for(const file of files){
        const {secure_url,public_id} = await uploadFileCloudinary(file,{
            folder: "profiles",       
            width: 512,              
            height: 512,
            crop: "fill"
        })
        result.push({secure_url,public_id})
    }
    return result
}

export const deleteFileCloudinary = async(public_id)=>{
    const result = await cloudinary.uploader.destroy(public_id)
    return result
}

export const deleteManyFileCloudinary = async(public_ids)=>{
    const result = await cloudinary.api.delete_resources(public_ids)
    return result
}


export const cleanUpFolderCloudinary = async(folder_name)=>{
    const result = await cloudinary.api.delete_resources_by_prefix(folder_name)
    return result
}

export const deleteFolderOnCloudinary = async(folder_name)=>{
    await cleanUpFolderCloudinary(folder_name)
    const result = await cloudinary.api.delete_folder(folder_name)
    return result
}