// .env faylini bevosita o'qib, process.env ga toza qiymatlarda yozadi.
// Faylda ba'zi o'zgaruvchilar bitta qatorga yopishib qolgan bo'lishi mumkin:
//   MONGODB_URI="mongodb+srv://...net"JWT_SECRET=...   (yangi qator yo'q)
// Shu format ham to'g'ri o'qilishi uchun qo'shtirnoq oralig'ida ajratib o'qiymiz.
const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

// Bitta qatorni key=value shaklida process.env ga yozadi
function applyLine(line) {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const idx = line.indexOf('=');
    if (idx === -1) return;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    // Key, qiymat qo'shtirnoqda boshLangan bo'lsa — yopuvchi qo'shtirnoqni topamiz
    if (value.startsWith('"') || value.startsWith("'")) {
        const quote = value[0];
        const closeIdx = value.indexOf(quote, 1);
        if (closeIdx !== -1) {
            // Qo'shtirnoq ichidagi qism — toza qiymat
            const clean = value.slice(1, closeIdx);
            const rest = value.slice(closeIdx + 1).trim();
            process.env[key] = clean;
            if (rest) applyLine(rest); // Orqada yopishgan boshqa o'zgaruvchi bols-a
            return;
        }
    }

    // Oddiy holat: atrofidagi qo'shtirnoqlar va \r qoldiqlarini tozalaymiz
    value = value.replace(/^["']+|["']+$/g, '').replace(/\r/g, '');

    const existing = process.env[key];
    if (existing === undefined || /^["' ]/.test(existing) || existing.includes('\r')) {
        process.env[key] = value;
    }
}

try {
    // Bir necha joyda .env ni izlaymiz (Render'da Root Directory har xil bo'lishi mumkin)
    const candidates = [
        path.join(process.cwd(), '.env'),
        path.join(__dirname, '..', '..', '.env'),
        path.join(__dirname, '..', '.env'),
    ];
    const envPath = candidates.find((p) => fs.existsSync(p));
    if (!envPath) {
        console.warn('.env fayli topilmadi — Render Environment Sozlamalaridagi o\'zgaruvchilar ishlatiladi');
    } else {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
            applyLine(line);
        }
        console.log('.env yuklandi:', envPath);
    }
} catch (error) {
    // .env fayli bo'lmasa, muhit o'zgaruvchilari bilan ishlashga urinamiz
    console.warn('.env o\'qishda muammo, muhit o\'zgaruvchilari ishlatiladi:', error.message);
}

module.exports = { applyLine };
