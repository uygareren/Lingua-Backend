const db = require("../config/database");

exports.PostFirstInfo = async (req, res) => {
    const userId = req.accountID;
    const { countryId, languageId } = req.body;

    try {
        const query = `
            UPDATE user 
            SET countryId = ?, languageId = ?
            WHERE id = ?;
        `;

        await db.mysqlQuery(query, [countryId, languageId, userId]); 

        return res.status(200).json({
            success: true,
            message: "Country and language information updated successfully."
        });
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};
