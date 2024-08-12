import CryptoJS from 'https://cdn.skypack.dev/crypto-js';

function generateRandomKey(length = 16) {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
}
const key = generateRandomKey()

export function encrypt(message, key) {
    try {
        const hashedKey = CryptoJS.SHA256(key).toString();
        const encrypted = CryptoJS.AES.encrypt(message, hashedKey);
        return encrypted.toString();
    } catch (error) {
        return null;
    }
}
export function decrypt(ciphertext, key) {
    try {
        const hashedKey = CryptoJS.SHA256(key).toString();
        const bytes = CryptoJS.AES.decrypt(ciphertext, hashedKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        return null;
    }
}
