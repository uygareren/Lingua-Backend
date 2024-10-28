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


