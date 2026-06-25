const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '/Users/elvieira/Documents/Code/LouvorJA/.env' });

const API_TOKEN = process.env.VITE_API_TOKEN;
const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

async function fetchApi(endpoint) {
    const url = `https://api.louvorja.com.br/json_db/${endpoint}?${date}`;
    const res = await fetch(url, { headers: { 'Api-Token': API_TOKEN } });
    if (!res.ok) {
        return null;
    }
    return await res.json();
}

async function main() {
    const h = await fetchApi('pt_bible_version');
    if (h) console.log('pt_bible_version len:', h.length, 'sample:', h[0]);
}

main().catch(console.error);
