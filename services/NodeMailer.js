const nodemailer = require('nodemailer');
const nodemailerConfig = require("../NodeMailerConfig.json");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: nodemailerConfig.user,
        pass: nodemailerConfig.pass,
    },
});

const FROM = 'aienglishgemini@gmail.com';

function sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error.message);
                resolve(false);
            } else {
                resolve(info.messageId);
            }
        });  
    });
}

exports.sendRegisterEmail = async(verificationCode, targetEmail)=> {
    const result = await sendEmail({
        from: FROM,
        to: targetEmail,
        subject: 'Verify Your Account!',
        html: SendRegisterEmailTemplate(verificationCode)
    });

    return result;
}

exports.ResendRegisterEmail = async(verificationCode, targetEmail)=> {
    const result = await sendEmail({
        from: FROM,
        to: targetEmail,
        subject: 'Verify Your Account!',
        html: SendRegisterEmailTemplate(verificationCode)
    });

    return result;
}

exports.SendForgetPasswordEmail = async(verificationCode, targetEmail)=> {
    const result = await sendEmail({
        from: FROM,
        to: targetEmail,
        subject: 'Forgot Password!',
        html: SendForgetPasswordEmailTemplate(verificationCode)
    });

    return result;
}



function SendRegisterEmailTemplate(verificationCode) {
    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .header img {
                    width: 250px;
                    height: 250px;
                    object-fit: cover;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h1 {
                    color: #333333;
                }
                .content p {
                    color: #666666;
                }
                .code {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #ffffff;
                    background: #1B708C;
                    border-radius: 4px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                    <img src="https://football-s3-bucket.s3.eu-central-1.amazonaws.com/post/gemspeak.jpeg" alt="GemSpeak Logo">
                </div>
                <div class="content">
                    <h1>Account verification</h1>
                    <p>Thank you for registering with GemSpeak! Please use the verification code below to complete your registration:</p>
                    <div class="code">${verificationCode}</div>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2024 GemSpeak. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
}

function SendForgetPasswordEmailTemplate(verificationCode) {
    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .header img {
                    width: 250px;
                    height: 250px;
                    object-fit: cover;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h1 {
                    color: #333333;
                }
                .content p {
                    color: #666666;
                }
                .code {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #ffffff;
                    background: #1B708C;
                    border-radius: 4px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://football-s3-bucket.s3.eu-central-1.amazonaws.com/post/gemspeak.jpeg" alt="Cyclemate Logo">
                </div>
                <div class="content">
                    <h1>Password Reset</h1>
                    <p>We've received a request to reset your password. Use the verification code below to continue:</p>
                    <div class="code">${verificationCode}</div>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2024 GemSpeak. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
}