import Database from "better-sqlite3";

const db = new Database("werkstatt.db");

console.log("Datenbank:", db.name);


//erstellen der Tabellen Für Autos und deren Aufgaben
db.exec(`
    CREATE TABLE IF NOT EXISTS autos (
    id INTEGER PRIMARY KEY,
    marke TEXT NOT NULL,
    model TEXT NOT NULL,
    submodel TEXTX,
    baujahr INTEGER,
    ankunft TEXT,
    prioritaet TEXT
    )
  `);

db.exec(`
    CREATE TABLE IF NOT EXISTS aufgaben (
    id INTEGER PRIMARY KEY,
    auto_id INTEGER,
    beschreibung TEXT NOT NULL,
    status INTEGER DEFAULT 0,
    FOREIGN KEY (auto_id) REFERENCES autos(id)
    )
`);

const aufgaben = db
  .prepare("SELECT * FROM aufgaben")
  .all();

console.log("Aufgaben:", aufgaben);

//Auto Hinzufügen
const autoEinfuegen = db.prepare(`
    INSERT INTO autos (
    id,
    marke,
    model,
    submodel,
    baujahr,
    ankunft,
    prioritaet
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// autoEinfuegen.run(
//   2,
//   "BMW",
//   "3er",
//   "320i",
//   2020,
//   "28.09.2026",
//   "mittel"
// );

console.log(
  db.prepare("SELECT * FROM autos").all()
);

//Aufgabe hinzufügen
const aufgabeEinfuegen = db.prepare(
  "INSERT INTO aufgaben VALUES (?, ?, ?, ?)"
);

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

//Auto Daten aktualisieren
const autoAktualisieren = db.prepare(`
    UPDATE autos
    SET baujahr = ?
    WHERE id = ?
`);

autoAktualisieren.run(2018, 1);

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