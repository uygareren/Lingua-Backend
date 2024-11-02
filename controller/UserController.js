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

exports.UpdateProfile = async (req, res) => {
    const userId = req.accountID; 
    const { name, surname, imageUrl } = req.body; 

    try {
        const query = `
            UPDATE user 
            SET 
                name = ?, 
                surname = ?, 
                imageUrl = ?, 
                updatedAt = NOW() 
            WHERE id = ?
        `;
        
        const result = await db.mysqlQuery(query, [name, surname, imageUrl, userId]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Profile updated successfully." });
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "An error occurred while updating the profile." });
    }
};

exports.PostStory = async(req, res) => {
    const userId = req.accountID;
    const { languageId, storyTitle, story } = req.body;

    try {
        const insertQuery = `
            INSERT INTO saved_stories (userId, languageId, storyTitle, story) 
            VALUES (?, ?, ?, ?)
        `;

        const insertResult = await db.mysqlQuery(insertQuery, [userId, languageId, storyTitle, story]);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false });
        }
        
    } catch (error) {
        console.error("PostWord error:", error); // Changed to match function name
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.GetStoriesByUserId = async (req, res) => {
    const userId = req.accountID;

    try {
        const query = `
            SELECT 
                l.id AS languageId,
                l.language,
                l.iconUrl,
                l.countryCode,
                COUNT(ss.story) AS storyCount
            FROM 
                language l
            JOIN 
                saved_stories ss ON l.id = ss.languageId 
            WHERE 
                ss.userId = ?
            GROUP BY 
                l.id, l.language, l.iconUrl, l.countryCode
        `;

        const results = await db.mysqlQuery(query, [userId]);

        return res.status(200).json({ success: true, data: results });
        
    } catch (error) {
        console.error("GetLanguageByUserId error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.getStoriesByLanguageId = async(req, res) => {
    const userId = req.accountID;
    const {languageId} = req.params;

    try {

        const savedWordsQuery = `
            SELECT id, storyTitle, story FROM saved_stories 
                WHERE userId = ? AND languageId = ? 
        `;

        const savedStoryResult = await db.mysqlQuery(savedWordsQuery, [userId, languageId]);
        return res.status(200).json({success:true, data:savedStoryResult});
        
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.getStoryDetail = async(req, res) => {
    const userId = req.accountID;
    const {storyId} = req.params;

    try {

        const savedWordsQuery = `
            SELECT id, storyTitle, story FROM saved_stories 
                WHERE userId = ? AND id = ? 
        `;

        const savedStoryResult = await db.mysqlQuery(savedWordsQuery, [userId, storyId]);
        return res.status(200).json({success:true, data:savedStoryResult});
        
    } catch (error) {
        console.error("PostFirstInfo error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
}

exports.DeleteStory = async (req, res) => {
    const userId = req.accountID;
    const { storyId } = req.body;

    try {
        const result = await db.mysqlQuery(
            "DELETE FROM saved_stories WHERE id = ? AND userId = ?",
            [storyId, userId]
        );

        if (result.affectedRows == 0) {
            return res.status(404).json({ success: false, message: "Hikaye bulunamadı veya erişim izniniz yok." });
        }

        return res.status(200).json({ success: true, message: "Hikaye başarıyla silindi." });
    } catch (error) {
        console.error("DeleteStory error:", error);
        return res.status(500).json({ success: false, message: "Sunucu hatası. Tekrar deneyin." });
    }
};

exports.SpeechToText = async (req, res) => {
    const {audioUrl, audioConfig} = req.body;
  
    if (!audioUrl) return res.status(422).send("No audio URL was provided.");
    if (!audioConfig)
      return res.status(422).send("No audio config was provided.");
  
    try {
      const speechResults = await fetch(
        "https://speech.googleapis.com/v1/speech:recognize",
        {
          method: "POST",
          body: JSON.stringify({
            audio: {
              content: audioUrl,
            },
            config: audioConfig,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-goog-api-key": `AIzaSyA4Bqu7Jr59fpSLuvI7X6GaD6r8QXpnyE8`,
          },
        }
      ).then((response) => response.json());
      return res.send(speechResults);
    } catch (err) {
      console.error("Error converting speech to text: ", err);
      res.status(404).send(err);
      return err;
    }
}

exports.GetStoriesByLanguageId = async (req, res) => {
    const { languageId } = req.params; 

    const query = 'SELECT * FROM stories WHERE languageId = ?';

    try {
        const results = await db.mysqlQuery(query, [languageId]); // mysqlQuery asenkron bir işlemse await kullanmalısınız
        return res.status(200).json({ success: true, results }); // 'staus' hatası düzeltildi
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Veritabanı hatası', error: error.message });
    }
};

exports.GetStoryDetailByStoryId = async (req, res) => {
    const { storyId } = req.params; 

    const query = 'SELECT * FROM stories WHERE id = ? LIMIT 1';

    try {
        const results = await db.mysqlQuery(query, [storyId]); // mysqlQuery asenkron bir işlemse await kullanmalısınız
        return res.status(200).json({ success: true, results }); // 'staus' hatası düzeltildi
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Veritabanı hatası', error: error.message });
    }
};

