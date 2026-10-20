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

const connectDB = async () => {
    try {
        const uri = resolveUri();
        await mongoose.connect(uri)
        console.log('Connected to MongoDB'); 
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        process.exit(1)
    }
}
module.exports = connectDB;