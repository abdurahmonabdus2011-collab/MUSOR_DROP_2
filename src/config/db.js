const mongoose = require('mongoose')

// MONGODB_URI / MONGO_URI ni tekshiradi va boshidagi-oxiridagi qo'shtirnoqlarni tozalaydi
function resolveUri() {
    const raw = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    const uri = raw.replace(/^["']+|["']+$/g, '').trim();
    if (!uri) {
        throw new Error(
            'MONGODB_URI muhit o\'zgaruvchisi topilmadi. ' +
            'Render Dashboard -> Web Service -> Environment bo\'limiga MONGODB_URI=mongodb+srv://... qilib qo\'shing.'
        );
    }
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
        throw new Error(
            'MONGODB_URI noto\'g\'ri formatda: "' + uri.slice(0, 20) + '..." ' +
            'Ulanish satri mongodb:// yoki mongodb+srv:// bilan boshlanishi kerak.'
        );
    }
    return uri;
}

const connectDB = async (retries = 5, delayMs = 5000) => {
    let uri;
    try {
        uri = resolveUri();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(uri);
            console.log('Connected to MongoDB');
            return;
        } catch (error) {
            const left = retries - attempt;
            console.error(
                `MongoDB ulanish xatosi (urinish ${attempt}/${retries}): ${error.message}` +
                (left > 0 ? ` — ${delayMs / 1000}s dan keyin yana urinamiz` : ' — barcha urinishlar tugadi')
            );
            if (left > 0) {
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
    }
    // Serverni o'ldirmaymiz: HTTP ishlashda davom etsin, ulanish keyin ham tiklanadi
    setInterval(() => {
        mongoose.connect(uri).then(() => console.log('Connected to MongoDB (retry)'))
            .catch((e) => console.error('MongoDB retry xato:', e.message));
    }, 30000);
};
module.exports = connectDB;