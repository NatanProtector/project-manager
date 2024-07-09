const crypto = require('crypto');

module.exports = function generateUniqueKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 13; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        key += chars[randomIndex];
    }
    return key;
}