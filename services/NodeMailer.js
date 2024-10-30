const nodemailer = require('nodemailer');
// const nodemailerConfig = require("../NodeMailerConfig.json");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "aienglishgemini@gmail.com",
        pass: "qprh pnqj jyyx hcyx",
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
        subject: 'Hesabını Onayla',
        html: SendRegisterEmailTemplate(verificationCode)
    });

    return result;
}

exports.ResendRegisterEmail = async(verificationCode, targetEmail)=> {
    const result = await sendEmail({
        from: FROM,
        to: targetEmail,
        subject: 'Hesabını Onayla',
        html: SendRegisterEmailTemplate(verificationCode)
    });

    return result;
}

exports.SendForgetPasswordEmail = async(verificationCode, targetEmail)=> {
    const result = await sendEmail({
        from: FROM,
        to: targetEmail,
        subject: 'Şifremi Unuttum',
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
                    <h1>Hesap doğrulama</h1>
                    <p>GemSpeak'e kaydolduğunuz için teşekkür ederiz! Lütfen kaydınızı tamamlamak için aşağıdaki doğrulama kodunu kullanın:</p>
                    <div class="code">${verificationCode}</div>
                    <p>Eğer bunu talep etmediyseniz lütfen bu e-postayı dikkate almayın.</p>
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
                    <h1>Şifre Sıfırlama</h1>
                    <p>Şifrenizi sıfırlamanız için bir istek aldık. Devam etmek için aşağıdaki doğrulama kodunu kullanın:</p>
                    <div class="code">${verificationCode}</div>
                    <p>Eğer bunu talep etmediyseniz lütfen bu e-postayı dikkate almayın.</p>
                </div>
                <div class="footer">
                    &copy; 2024 GemSpeak. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
}