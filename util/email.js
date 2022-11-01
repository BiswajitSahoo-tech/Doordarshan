const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')


module.exports = class Email{
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = 'Biswajit Sahoo <'+process.env.EMAIL_FROM+'>'
    }
    newTransport(){
        if( process.env.NODE_ENV == 'production'){
            //sendgrid
            return 1
        }
        else{
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                  user: process.env.EMAIL_USERNAME,
                  pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }
    async send( template, subject){
        //send the actual email
        //first render the  html based on the pug template
        const html = pug.renderFile(__dirname+'/../views/emails/'+template+'.pug', {
            firstName: this.firstName,
            url: this.url,
            subject
        })
        //define the email option
        const emailOptions = {
            from: this.from,
            to: this.to,
            subject ,
            html,
            text: htmlToText.fromString( html),
            // html:
        }

        //create a transport and send email
        await this.newTransport().sendMail(emailOptions)
    }
    async sendWelcome(){
        await this.send('welcome',  'Welcome to the Natours family')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your Password reset token| only valid for 10 min')
    }
}
