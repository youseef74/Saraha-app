import crypto from "node:crypto";
import fs from "node:fs";

const IV_LENGTH = +process.env.IV_LENGTH;
const ENCRYPTION_SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY);

export const encrypt = (text) => {
    const Iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, Iv);

    let encryptedData = cipher.update(text, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    return `${Iv.toString('hex')}:${encryptedData}`;
};

export const decrypt = (text) => {
    const [iv, encryptedtext] = text.split(':');
    const binaryLike = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLike);

    let decryptedData = decipher.update(encryptedtext, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');

    return decryptedData;
};


if(fs.existsSync('publicKey.pem')&&fs.existsSync('privateKey.pem')){
    console.log("Keys already exist");

}else{
    const {publicKey,privateKey} = crypto.generateKeyPairSync('rsa',{
        modulusLength:2048,
        publicKeyEncoding:{
            type:'spki',
            format:'pem'
        },
        privateKeyEncoding:{
            type:'pkcs8',
            format:'pem'
        }
    })
    
    fs.writeFileSync('publicKey.pem',publicKey)
    fs.writeFileSync('privateKey.pem',privateKey)
    }

    export const asymmetricEncrypt = (text)=>{
        const publicKey = fs.readFileSync('publicKey.pem')

        const bufferTexted = Buffer.from(text)

        const encryptedData = crypto.publicEncrypt({
            key:publicKey,
            padding:crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        bufferTexted
    )

        return encryptedData.toString('hex')
    }


    export const asymmetricDecrypt = (text)=>{
        const privateKey = fs.readFileSync('privateKey.pem')

        const bufferTexted = Buffer.from(text,'hex')

        const decryptedData = crypto.privateDecrypt({
            key:privateKey,
            padding:crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        bufferTexted
    )

        return decryptedData.toString('hex')
    }