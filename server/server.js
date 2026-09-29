import express from "express";
import cors from "cors";
import db from "./database.js";


// Express-Anwendung erstellen
const app = express();

// Middleware für Cross-Origin-Anfragen und JSON-Daten
app.use(cors());
app.use(express.json());

const PORT = 3000;


// Gibt alle Autos inklusive ihrer Aufgaben zurück
app.get("/api/autos", (req, res) => {
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
        LEFT JOIN aufgaben
        ON autos.id = aufgaben.auto_id
  `)
  .all();


// Die SQL-Abfrage liefert für jede Aufgabe eine eigene Zeile.
// Hier werden die einzelnen Zeilen wieder zu Autos mit Aufgaben zusammengeführt.
const autos = [];

ergebnis.forEach((eintrag) => {
    let auto = autos.find(
     (auto) => auto.id === eintrag.id
    );

// Wenn das Auto noch nicht existiert, wird es angelegt.
        if (!auto) {
          auto = {
          id: eintrag.id,
          marke: eintrag.marke,
          model: eintrag.model,
          submodel: eintrag.submodel,
          baujahr: eintrag.baujahr,
          ankunft: eintrag.ankunft,
          prioritaet: eintrag.prioritaet,
          aufgaben: []
        };

  autos.push(auto);
}

// LEFT JOIN liefert bei einem Auto ohne Aufgaben null.
// Nur vorhandene Aufgaben werden deshalb zur Liste hinzugefügt.
if (eintrag.aufgabe_id !== null) {
  auto.aufgaben.push({
    id: eintrag.aufgabe_id,
    title: eintrag.beschreibung,
    fertig: eintrag.status === 1
  });
}

});

    res.json(autos);
});

// Erstellt ein neues Auto und speichert dessen Aufgaben
app.post("/api/autos", (req, res) => {
  const neuesAuto = req.body;

  const statement = db.prepare(`
    INSERT INTO autos (
      marke,
      model,
      submodel,
      baujahr,
      ankunft,
      prioritaet
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Die von SQLite vergebene ID wird zum gespeicherten Auto hinzugefügt.
  const ergebnis = statement.run(
    neuesAuto.marke,
    neuesAuto.model,
    neuesAuto.submodel,
    neuesAuto.baujahr,
    neuesAuto.ankunft,
    neuesAuto.prioritaet
  );

  const gespeichertesAuto = {
    ...neuesAuto,
    id: Number(ergebnis.lastInsertRowid)
  };

gespeichertesAuto.aufgaben.forEach((aufgabe) => {
  db.prepare(`
    INSERT INTO aufgaben (
      auto_id,
      beschreibung,
      status
    )
    VALUES (?, ?, ?)
  `).run(
    gespeichertesAuto.id,
    aufgabe.title,
    aufgabe.fertig ? 1 : 0
  );
});

  res.status(201).json(gespeichertesAuto);
});

// Erstellt eine einzelne Aufgabe für ein bereits vorhandenes Auto
app.post("/api/autos/:id/aufgaben", (req, res) => {
    const autoId = Number(req.params.id);
    const { beschreibung } = req.body;

    const statement = db.prepare(`
        INSERT INTO aufgaben (
        auto_id,
        beschreibung,
        status
        )
        VALUES (?, ?, ?)
        `);

        const ergebnis = statement.run(
            autoId,
            beschreibung,
            0
        );

    res.status(201).json({
    id: Number(ergebnis.lastInsertRowid),
    auto_id: autoId,
    beschreibung: beschreibung,
    status: 0

  });
});


// Löscht ein Auto und alle dazugehörigen Aufgaben
app.delete("/api/autos/:id", (req, res) => {
  const id = Number(req.params.id);

// Anschließend das Auto selbst löschen.
  db.prepare(`
  DELETE FROM aufgaben
  WHERE auto_id = ?
`).run(id);


// Anschließend das Auto selbst löschen.
  db.prepare(`
  DELETE FROM autos
  WHERE id = ?
  `).run(id);

  res.json({
    message: "Auto gelöscht"
  });
});


// Aktualisiert ein Auto und synchronisiert dessen Aufgaben
app.put("/api/autos/:id", (req, res) => {

const neuesAuto = req.body;
const id = Number(req.params.id);

const statement = db.prepare(`
  UPDATE autos
  SET
    marke = ?,
    model = ?,
    submodel = ?,
    baujahr = ?,
    prioritaet = ?
  WHERE id = ?
`);

statement.run(
  neuesAuto.marke,
  neuesAuto.model,
  neuesAuto.submodel,
  neuesAuto.baujahr,
  neuesAuto.prioritaet,
  neuesAuto.id
);

// Vorhandene Aufgaben aus der Datenbank laden.
// Dadurch kann später erkannt werden, welche Aufgaben gelöscht wurden.
const datenbankAufgaben = db
  .prepare(`
    SELECT id
    FROM aufgaben
    WHERE auto_id = ?
  `)
  .all(id);

// Aufgaben löschen, die im bearbeiteten Auto nicht mehr vorhanden sind.
datenbankAufgaben.forEach((datenbankAufgabe) => {
  const nochVorhanden = neuesAuto.aufgaben.some(
    (aufgabe) => aufgabe.id === datenbankAufgabe.id
  );

  if (!nochVorhanden) {
    db.prepare(`
      DELETE FROM aufgaben
      WHERE id = ?
    `).run(datenbankAufgabe.id);
  }
});

// Neue Aufgaben einfügen und vorhandene Aufgaben aktualisieren.
neuesAuto.aufgaben.forEach((aufgabe) => {
  if (!aufgabe.id) {

 // Neue Aufgabe
      db.prepare(`
      INSERT INTO aufgaben (
        auto_id,
        beschreibung,
        status
      )
      VALUES (?, ?, ?)
    `).run(
      neuesAuto.id,
      aufgabe.title,
      aufgabe.fertig ? 1 : 0
    );

  } else {

// Bereits vorhandene Aufgabe
  const statement = db.prepare(`
    UPDATE aufgaben
    SET
      beschreibung = ?,
      status = ?
    WHERE id = ?
  `);

  statement.run(
    aufgabe.title,
    aufgabe.fertig ? 1 : 0,
    aufgabe.id
  );
}
});

  res.json(neuesAuto);
})

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

