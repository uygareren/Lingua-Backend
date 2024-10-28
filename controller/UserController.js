const db = require("../config/database");

exports.PostFirstInfo = async (req, res) => {
    const userId = req.accountID;
    const { countryId, languageId, spokenLanguageId } = req.body;

    try {
        const query = `
            UPDATE user 
            SET countryId = ?, languageId = ?, spokenLanguageId = ?, infoStatus = ?
            WHERE id = ?;
        `;

        await db.mysqlQuery(query, [countryId, languageId, spokenLanguageId, 1, userId]); 

        return res.status(200).json({
            success: true,
            message: "Country and language information updated successfully."
        });
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.SetLanguage = async (req, res) => {
    const userId = req.accountID;
    const {spokenLanguageId } = req.body;

    try {

        const query = `
            UPDATE user 
            SET spokenLanguageId = ?
            WHERE id = ?
            LIMIT 1;
        `;

        await db.mysqlQuery(query, [spokenLanguageId, userId]); 

        return res.status(200).json({
            success: true,
            message: "language information updated successfully."
        });
        
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.SetCountry = async(req, res) =>{
    const userId = req.accountID;
    const {countryId} = req.body;

    try {
        const updateQuery = `
            UPDATE user SET countryId = ? WHERE id = ? LIMIT 1
        `;
        await db.mysqlQuery(updateQuery, [countryId, userId]);

        return res.status(200).json({success:true});

    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.PostWord = async (req, res) => {
    const userId = req.accountID;
    const { languageId, word } = req.body;

    try {
        // Corrected the SQL syntax to use placeholders correctly
        const insertQuery = `
            INSERT INTO saved_words (userId, languageId, word) 
            VALUES (?, ?, ?)
        `;

        const insertResult = await db.mysqlQuery(insertQuery, [userId, languageId, word]);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false });
        }
        
    } catch (error) {
        console.error("PostWord error:", error); // Changed to match function name
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.GetLanguageByUserId = async (req, res) => {
    const userId = req.accountID;

    try {
        const query = `
            SELECT 
                l.id AS languageId,
                l.language,
                l.iconUrl,
                l.countryCode,
                COUNT(sw.word) AS wordCount
            FROM 
                language l
            JOIN 
                saved_words sw ON l.id = sw.languageId 
            WHERE 
                sw.userId = ?
            GROUP BY 
                l.id, l.language, l.iconUrl, l.countryCode
        `;

        const results = await db.mysqlQuery(query, [userId]);

        return res.status(200).json({ success: true, data: results });
        
    } catch (error) {
        console.error("GetLanguageByUserId error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.GetLanguageDetail = async(req, res) => {
    const userId = req.accountID;
    const {languageId} = req.params;

    try {

        const savedWordsQuery = `
            SELECT id, word FROM saved_words 
                WHERE userId = ? AND languageId = ? 
        `;

        const savedWordsResult = await db.mysqlQuery(savedWordsQuery, [userId, languageId]);
        return res.status(200).json({success:true, data:savedWordsResult});
        
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.SendWordToLearn = async (req, res) => {
    const userId = req.accountID;
    const { id, languageId, word } = req.body;

    try {
        const deleteQuery = `
            DELETE FROM saved_words
            WHERE id = ? AND userId = ?
        `;
        const deleteResult = await db.mysqlQuery(deleteQuery, [id, userId]);

        if (deleteResult.affectedRows > 0) {
            const insertQuery = `
                INSERT INTO learnt_words (userId, languageId, word)
                VALUES (?, ?, ?)
            `;
            const insertResult = await db.mysqlQuery(insertQuery, [userId, languageId, word]);

            return res.status(200).json({ success: true, message: "Kelime başarıyla öğrenildi." });
        } else {
            return res.status(404).json({ success: false, message: "Kelime bulunamadı." });
        }
        
    } catch (error) {
        console.error("SendWordToLearn error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.GetLearntLanguageByUserId = async (req, res) => {
    const userId = req.accountID;

    try {
        const query = `
            SELECT 
                l.id AS languageId,
                l.language,
                l.iconUrl,
                l.countryCode,
                COUNT(lw.word) AS wordCount
            FROM 
                language l
            JOIN 
                learnt_words lw ON l.id = lw.languageId 
            WHERE 
                lw.userId = ?
            GROUP BY 
                l.id, l.language, l.iconUrl, l.countryCode
        `;

        const results = await db.mysqlQuery(query, [userId]);

        return res.status(200).json({ success: true, data: results });
        
    } catch (error) {
        console.error("GetLanguageByUserId error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.GetLearntLanguageDetail = async(req, res) => {
    const userId = req.accountID;
    const {languageId} = req.params;

    try {

        const leanrtWordsQuery = `
            SELECT id, word FROM learnt_words 
                WHERE userId = ? AND languageId = ? 
        `;

        const learntWordsResult = await db.mysqlQuery(leanrtWordsQuery, [userId, languageId]);
        return res.status(200).json({success:true, data:learntWordsResult});
        
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}



