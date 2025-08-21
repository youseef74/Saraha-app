import nodemailer from "nodemailer";
import { EventEmitter } from "events";


export const sendMail = async({
    to,
    cc,
    subject,
    content,
    attachments = []
})=>{

    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.USER_EMAIL,
            pass:process.env.USER_PASSWORD
        },tls: {
            rejectUnauthorized: false
          }
    })

    const info = await transporter.sendMail({
        from:'kandilyossef100@gmail.com',
        to,
        cc,
        subject,
        html:content,
        attachments
    })

    console.log("Email sent successfully",info);
    
    return info
}


export const emitter = new EventEmitter()


emitter.on('sendEmail', async (emailArgs) => {
    console.log("Sending email with args:", emailArgs);

    try {
        await sendMail(emailArgs);
        console.log("Email sent via emitter successfully.");
    } catch (error) {
        console.error("Error while sending email via emitter:", error);
    }
});

    
