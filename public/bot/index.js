const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const config = require('../config');
const yts = require('yt-search');

async function startUbaidBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const conn = makeWASocket({ auth: state, logger: require('pino')({ level: 'silent' }) });

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', (u) => {
        if (u.connection === 'close') {
            if (new Boom(u.lastDisconnect.error).output.statusCode !== DisconnectReason.loggedOut) startUbaidBot();
        } else if (u.connection === 'open') {
            console.log('✅ Ubaidullah-Baloch-MD is Connected!');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const cmd = body.startsWith(config.prefix) ? body.slice(1).trim().split(' ')[0].toLowerCase() : "";

        if (cmd === 'menu') {
            await conn.sendMessage(from, { 
                image: { url: config.thumb }, 
                caption: `*Hello Boss!*\n\n*Commands:*\n.alive\n.owner\n.yt [song name]` 
            });
        }
        if (cmd === 'alive') await conn.sendMessage(from, { text: "Ubaidullah-Baloch-MD is active! 🚀" });
        if (cmd === 'owner') await conn.sendMessage(from, { text: `Owner: ${config.ownerName}\nContact: ${config.ownerNumber}` });
    });
}
startUbaidBot();
