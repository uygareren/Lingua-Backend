const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createToken, decodeToken } = require('../utils/jwt');
const db = require("../config/database");
const crypto = require("crypto");
const { sendRegisterEmail, ResendRegisterEmail, SendForgetPasswordEmail } = require('../services/NodeMailer');

exports.Register = async (req, res) => {
    const { name, surname, email, phone, password, password2, username } = req.body;

    // Check if passwords match
    if (password !== password2) {
        return res.status(400).json({ success: false, message: "Parolalar uyuşmuyor!" });
    }

    try {
        // Query to check if email, username, or phone already exist
        const checkUserQuery = `
            SELECT * FROM user
            WHERE email = ? OR username = ? OR phone = ?
            LIMIT 1
        `;
        const existingUser = await db.mysqlQuery(checkUserQuery, [email, username, phone]);

        // If user exists, handle accordingly
        if (existingUser.length > 0) {
            const user = existingUser[0];

            if (user.email === email) {
                // If email exists and account is inactive, send a new verification code
                if (user.activeAccount === 0) {
                    // Delete any previous verification codes
                    const deleteCodeQuery = `
                        DELETE FROM register_codes
                        WHERE userId = ?;
                    `;
                    await db.mysqlQuery(deleteCodeQuery, [user.id]);

                    // Generate and insert a new verification code
                    const code = Math.floor(100000 + Math.random() * 900000);
                    const insertCodeQuery = `
                        INSERT INTO register_codes (userId, code)
                        VALUES (?, ?);
                    `;
                    await db.mysqlQuery(insertCodeQuery, [user.id, code]);

                    return res.status(200).json({
                        success: true,
                        message: "Kayıt başarılı, yeni doğrulama kodu gönderildi.",
                        code: code,
                        userId: user.id
                    });
                } else {
                    return res.status(400).json({ success: false, message: "Bu E-posta zaten kullanılıyor!" });
                }
            }

            if (user.phone === phone) {
                return res.status(400).json({ success: false, message: "Bu telefon numarası zaten kullanılıyor!" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const authToken = crypto.randomUUID();
        const imageUrl = (Math.floor(Math.random() * 8) + 1).toString(); // Random string between "1" and "8"

        const insertUserQuery = `
            INSERT INTO user (name, surname, email, phone, password, authToken, createdAt, updatedAt, activeAccount, username, imageUrl)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, ?, ?)
        `;
        await db.mysqlQuery(insertUserQuery, [name, surname, email, phone, hashedPassword, authToken, username, imageUrl]);

        const newUserQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;
        const newUserResult = await db.mysqlQuery(newUserQuery, [email]);
        const newUserId = newUserResult[0].id;

        const code = Math.floor(100000 + Math.random() * 900000);
        const insertCodeQuery = `
            INSERT INTO register_codes (userId, code)
            VALUES (?, ?);
        `;
        await db.mysqlQuery(insertCodeQuery, [newUserId, code]);
        await sendRegisterEmail(code, email);

        return res.status(200).json({
            success: true,
            message: "Kayıt başarılı.",
            code: code,
            userId: newUserId
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};


exports.VerifyRegisterCode = async(req, res) => {
    const {email, code} = req.body;

    try {
        const findUserQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;
        const userResult = await db.mysqlQuery(findUserQuery, [email]);

        if (!userResult.length) {
            return res.status(400).json({ success: false, message: "Böyle bir email'e sahip kullanıcı bulunamadı!" });
        }

        const userId = userResult[0].id;

        const verifyCodeQuery = `
            SELECT code FROM register_codes
            WHERE userId = ?
            LIMIT 1;
        `;

        const verifyResult = await db.mysqlQuery(verifyCodeQuery, [userId]);

        if (!verifyResult.length || !verifyResult[0].code) {
            return res.status(400).json({ success: false, message: "Böyle bir kullanıcıya ait kod yok!" });
        }

        if (verifyResult[0].code == code) {
            const updateUserActiveQuery = `
                UPDATE user SET activeAccount = 1 WHERE id = ? LIMIT 1;
            `;
            await db.mysqlQuery(updateUserActiveQuery, [userId]);

            const deleteVerifyCodeQuery = `
                DELETE FROM register_codes
                WHERE code = ? AND userId = ?
                LIMIT 1;
            `;
            await db.mysqlQuery(deleteVerifyCodeQuery, [code, userId]);

            return res.status(200).json({ success: true, message: "Kod Doğrulandı!" });
        } else {
            return res.status(400).json({ success: false, message: "Kod Doğrulanamadı!" });
        }

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};


exports.ResendVerifyRegisterCode = async (req, res) => {
    const { email } = req.body;

    try {
        const findUserQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;
        const userResult = await db.mysqlQuery(findUserQuery, [email]);

        if (!userResult.length) {
            return res.status(400).json({ success: false, message: "Böyle bir email'e sahip kullanıcı bulunamadı!" });
        }

        const userId = userResult[0].id;

        const code = Math.floor(100000 + Math.random() * 900000);

        const verifyCodeQuery = `
            DELETE FROM register_codes WHERE userId = ?;
            INSERT INTO register_codes (userId, code) VALUES (?, ?);
        `;

        await db.mysqlQuery(verifyCodeQuery, [userId, userId, code]);

        await ResendRegisterEmail(code, email);
        return res.status(200).json({ success: true, message: "Yeni kod gönderildi!", code });

    } catch (error) {
        console.error("Resend Verify Register Code error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};


exports.ForgetPasswordEmailVerification = async (req, res) => {
    const { email } = req.body;

    try {
        const userQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;

        const user = await db.mysqlQuery(userQuery, [email]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userId = user[0].id;
        const code = Math.floor(100000 + Math.random() * 900000);

        const deleteOldCodeQuery = `
            DELETE FROM forget_password_codes WHERE userId = ?;
        `;
        await db.mysqlQuery(deleteOldCodeQuery, [userId]);

        const forgetCodeInsertQuery = `
            INSERT INTO forget_password_codes (userId, code, createdAt)
            VALUES (?, ?, CURRENT_TIMESTAMP);
        `;

        await db.mysqlQuery(forgetCodeInsertQuery, [userId, code]);
        await SendForgetPasswordEmail(code, email);

        return res.status(200).json({ success: true, message: "Reset code sent", code });
   
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.VerifyForgetPassword = async (req, res) => {
    const { email, code } = req.body;

    try {
        const userQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;
        const userResult = await db.mysqlQuery(userQuery, [email]);

        if (userResult.length == 0) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const userId = userResult[0].id;

        const codeQuery = `
            SELECT code FROM forget_password_codes WHERE userId = ? LIMIT 1;
        `;
        const codeResult = await db.mysqlQuery(codeQuery, [userId]);

        if (codeResult.length == 0) {
            return res.status(400).json({ success: false, message: "No reset code found for this user" });
        }

        const dbCode = codeResult[0].code;

        if (dbCode != code) {
            return res.status(400).json({ success: false, message: "Invalid reset code" });
        }

        const deleteCodeQuery = `
            DELETE FROM forget_password_codes WHERE userId = ?;
        `;
        await db.mysqlQuery(deleteCodeQuery, [userId]);

        return res.status(200).json({ success: true, message: "Code verified successfully" });

    } catch (error) {
        console.error("VerifyForgetPassword error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};


exports.ResendVerifyForgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userQuery = `
            SELECT id FROM user WHERE email = ? LIMIT 1;
        `;
        const userResult = await db.mysqlQuery(userQuery, [email]);

        if (userResult.length === 0) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const userId = userResult[0].id;

        const newCode = Math.floor(100000 + Math.random() * 900000);

        const upsertCodeQuery = `
            DELETE FROM forget_password_codes WHERE userId = ?;
            INSERT INTO forget_password_codes (userId, code)
            VALUES (?, ?);
        `;
        await SendForgetPasswordEmail(newCode, email);

        await db.mysqlQuery(upsertCodeQuery, [userId, userId, newCode]);

        return res.status(200).json({ success: true, message: "New code has been sent.", code:newCode });

    } catch (error) {
        console.error("ResendVerifyForgetPassword error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};

exports.ForgetPasswordResetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updatePasswordQuery = `
            UPDATE user 
            SET password = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE email = ?
        `;
        await db.mysqlQuery(updatePasswordQuery, [hashedPassword, email]);

        return res.status(200).json({ success: true, message: "Password has been reset successfully." });

    } catch (error) {
        console.error("ForgetPasswordResetPassword error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};

exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = 'SELECT id, name, surname, email, phone, imageUrl, activeAccount, infoStatus, username, password, countryId, languageId FROM user WHERE email = ? LIMIT 1'; // password eklenmeli

        const results = await db.mysqlQuery(userQuery, [email]);

        if (results.length == 0) {
            return res.status(400).json({ success: false, message: 'Invalid email or password', code: 1000 });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password); // burada user.password undefined olmamalı
        
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password', code: 1000 });
        }

        if (user.activeAccount != 1) {
            return res.status(400).json({ success: false, message: 'Account is not activated. Please check your email for the verification code.', code: 1001 });
        }

        const authToken = crypto.randomUUID(); 

        const updateQuery = `
            UPDATE user 
            SET authToken = ?, 
                loginDate = CURRENT_TIMESTAMP() 
            WHERE id = ?
            LIMIT 1
        `;

        await db.mysqlQuery(updateQuery, [authToken, user.id]); 

        const jwt = createToken(authToken);
        res.status(200).json({ 
            success: true, 
            jwt,
            user: {  
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                imageUrl: user.imageUrl,
                username: user.username,
                activeAccount: user.activeAccount,
                countryId: user.countryId,
                languageId: user.languageId,
                infoStatus: user.infoStatus

            } 
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}



exports.loginWithToken = async (req, res) => {
    const tokenHeader = req.headers["authorization"];
    
    if (!tokenHeader || tokenHeader === 'null' || tokenHeader == null) {
        return res.status(401).send();
    }

    let jwt = tokenHeader.replace("Bearer ", "");

    if (jwt === "") {
        return res.status(401).send();
    }

    let authToken = decodeToken(jwt);
    if (!authToken) {
        return res.status(401).send();
    }

    try {

        // Correctly handle authToken as a hex value for the query
        const userQuery = `SELECT * FROM user WHERE authToken = ? AND activeAccount = 1 LIMIT 1`;
        const [user] = await db.mysqlQuery(userQuery, [authToken]); // Pass authToken as parameter


        if (user == undefined) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const updateAccountQuery = 'UPDATE user SET loginDate = CURRENT_TIMESTAMP(), isOnline = 1 WHERE id = ?';
        await db.mysqlQuery(updateAccountQuery, [user.id]);

        const userInfo = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone,
            imageUrl: user.imageUrl,
            username: user.username,
            activeAccount: user.activeAccount,
            countryId: user.countryId,
            languageId: user.languageId,
            infoStatus: user.infoStatus

        };

        res.status(200).json({ success: true, message: 'Login successful', userInfo, jwt });

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.PasswordUpdate = async (req, res) => {
    const userId = req.accountID;
    const { newPassword } = req.body;

    try {
        const passwordQuery = `
            SELECT password FROM user WHERE id = ? LIMIT 1
        `;
        const passwordResult = await db.mysqlQuery(passwordQuery, [userId]);

        if (!passwordResult.length) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const currentPasswordHash = passwordResult[0].password;

        const isSamePassword = await bcrypt.compare(newPassword, currentPasswordHash);

        if (isSamePassword) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as the old password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10); 

        const updateQuery = `
            UPDATE user SET password = ? WHERE id = ?
        `;
        await db.mysqlQuery(updateQuery, [hashedPassword, userId]);

        return res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.Logout = async (req, res) => {
    const userId = req.accountID 
    try {
        const query = `
            UPDATE user
            SET isOnline = 0,
                authToken = NULL
            WHERE id = ?;
        `;

        await db.mysqlQuery(query, [userId]);

        res.status(200).json({ message: "Başarıyla çıkış yapıldı." });
    } catch (error) {
        console.error("Logout sırasında hata:", error);
        res.status(500).json({ message: "Çıkış yaparken bir hata oluştu." });
    }
};

exports.DeactivateAccount = async (req, res) => {
    const userId = req.accountID 
    try {
        const query = `
            UPDATE user
            SET activeAccount = 0,
                isOnline = 0,
                authToken = NULL
            WHERE id = ?;
        `;

        await db.mysqlQuery(query, [userId]);

        res.status(200).json({ message: "Hesabınız başarıyla kapatıldı." });
    } catch (error) {
        console.error("Hesabı kapatırken hata:", error);
        res.status(500).json({ message: "Hesabınızı kapatırken bir hata oluştu." });
    }
};




