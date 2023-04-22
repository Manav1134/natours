/*eslint-disable*/
const nodemailer= require("nodemailer")
const pug=require("pug")
const { htmlToText }=require("html-to-text")
//new Email(user,url).sendWelcome();

module.exports= class Email{
constructor(user,url){
this.to=user.email;
this.firstName=user.name.split(" ")[0]
this.url=url;
this.from=`manav22 <${process.env.EMAIL_FROM}>`;
}

newTransport(){
    if(process.env.NODE_ENV==="production"){
        //SENDGRIDE
        return 1;
    }
    return nodemailer.createTransport({
        host: process.env.HOST_NAME,
        port: process.env.EMAIL_PORT,
        // secure: false,
        // logger: true,
    auth:{
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
})
}
//send actual email
async send(template,subject){
    //1.) Render HTML based on a pig template
const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
{
firstName:this.firstName,
url:this.url,
subject
})
    //2.)define email options
    const mailOptions={
        from:this.from,
        to:this.to,
        subject,
        html,
        text:htmlToText()

    }
    //3.)create a transport and send email
    await this.newTransport().sendMail(mailOptions)
}
async sendWelcome(){
  await this.send("Welcome", "Welcome to the Natours family")
}
};
