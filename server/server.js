import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;


const autos = [
    {
        id: 1,
        marke: "Ford",
        model: "Focus",
        submodel: "ST",
        baujahr: 2012,
        ankunft: "25.09.2026",
        prioritaet: "hoch",
        aufgaben: [
            {id: 12,
                title: "Ölwechsel",
                fertig: true
            },
            {
                id: 2, 
                title: "Reifenwechsel",
                fertig: false
            }
        ]
    }
];

console.log("Autos-route wird registriert");

app.get("/api/autos", (req, res) => {
    res.json(autos);
});

app.post("/api/autos", (req, res) => {
    const neuesAuto = req.body;

    autos.push(neuesAuto);

    res.status(201).json(neuesAuto);
});

app.delete("/api/autos/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = autos.findIndex((auto) => auto.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Auto nnicht gefunden"
        });
    }

    const geloeschtesAuto = autos.splice(index, 1);

    res.json(geloeschtesAuto[0]);
});

app.put("/api/autos/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = autos.findIndex((auto) => auto.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Auto nicht gefunden."
        });
    }

    autos[index] = req.body;

    res.json(autos[index]);
})

console.log("PUT-Route geladen");


app.listen(PORT, () => {
    console.log(`Server läuft auf nttp://localhost:${PORT}`);
});

