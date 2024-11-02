const db = require("../config/database");

exports.GetCountry = async (req, res) => {
    try {
        const query = `
            SELECT id, countryName, code_1, code_2, iconUrl
            FROM country;
        `;
        
        const countries = await db.mysqlQuery(query); // Veritabanı sorgusunu çalıştır

        return res.status(200).json({
            success: true,
            data: countries // Ülke verilerini gönder
        });
    } catch (error) {
        console.error("GetCountry error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};


exports.GetLanguage = async (req, res) => {
    try {
        const query = `
            SELECT id, language, iconUrl, countryCode, countryCode2
            FROM language;
        `;
        
        const languages = await db.mysqlQuery(query); // Veritabanı sorgusunu çalıştır

        return res.status(200).json({
            success: true,
            data: languages // Dil verilerini gönder
        });
    } catch (error) {
        console.error("GetLanguage error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

