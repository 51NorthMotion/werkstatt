import Database from "better-sqlite3";

const db = new Database("werkstatt.db");

console.log("Datenbank:", db.name);

db.pragma("foreign_keys = ON");


// Benutzer
db.exec(`
  CREATE TABLE IF NOT EXISTS benutzer (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwort_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'kunde'
  )
`);

// Autos
db.exec(`
  CREATE TABLE IF NOT EXISTS autos (
    id INTEGER PRIMARY KEY,
    marke TEXT NOT NULL,
    model TEXT NOT NULL,
    submodel TEXT NOT NULL,
    baujahr INTEGER,
    ankunft TEXT,
    prioritaet TEXT,
    kunden_id INTEGER,
    FOREIGN KEY (kunden_id) REFERENCES benutzer(id)
  )
`);

// Aufgaben
db.exec(`
  CREATE TABLE IF NOT EXISTS aufgaben (
    id INTEGER PRIMARY KEY,
    auto_id INTEGER,
    beschreibung TEXT NOT NULL,
    status INTEGER DEFAULT 0,
    FOREIGN KEY (auto_id) REFERENCES autos(id)
  )
`);

console.log(
  db.prepare(`PRAGMA table_info(autos)`).all()
);

const aufgaben = db
  .prepare("SELECT * FROM aufgaben")
  .all();

console.log("Aufgaben:", aufgaben);

//Tabellen zusammenführen
const ergebnis = db
  .prepare(`
    SELECT
      autos.id,
      autos.marke,
      autos.model,
      autos.submodel,
      autos.baujahr,
      autos.ankunft,
      autos.prioritaet,
      aufgaben.id AS aufgabe_id,
      aufgaben.beschreibung,
      aufgaben.status
    FROM autos
    INNER JOIN aufgaben
    ON autos.id = aufgaben.auto_id
  `)
  .all();

console.log(ergebnis);

//Auto Daten löschen
const autoLoeschen = db.prepare(`
    DELETE FROM autos
    WHERE id = ?
`);

const autosNachLoeschen = db
  .prepare("SELECT * FROM autos")
  .all();

console.log(autosNachLoeschen);

const autos = db
  .prepare("SELECT * FROM autos")
  .all();

console.log(autos);


export default db;