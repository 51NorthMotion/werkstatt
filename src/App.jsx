import { useState, useEffect } from 'react';
import './App.css';

function App() {
  

// useStates für funktionen

  const [marke, setMarke] = useState("");
  const [model, setModel] = useState("");
  const [submodel, setSubmodel] = useState("");
  const [baujahr, setBaujahr] = useState("");
  const [prioritaet, setPrioritaet] = useState("");
  const [popupOffen, setPopupOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState(null);
  const [neueAufgabe, setNeueAufgabe] = useState("");
  const [aufgabenListe, setAufgabenListe] = useState([]);
  const [fehler, setFehler] = useState("");
  const [autoList, setAutoList] = useState([]);
  const [bearbeiten, setBearbeiten] = useState(false);

//useStates zum bearbeiten der Fahrzeugdaten
const [bearbeitenMarke, setBearbeitenMarke] = useState("");
const [bearbeitenModel, setBearbeitenModel] = useState("");
const [bearbeitenSubmodel, setBearbeitenSubmodel] = useState("");
const [bearbeitenBaujahr, setBearbeitenBaujahr] = useState("");
const [bearbeitenPrioritaet, setBearbeitenPrioritaet] = useState("");
const [bearbeitenAufgaben, setBearbeitenAufgaben] = useState([]);
const [bearbeitenNeueAufgabe, setBearbeitenNeueAufgabe] = useState("");

//Laden der datem auf der API
  useEffect(() => {
    fetch("http://localhost:3000/api/autos")
    .then((response) => response.json())
    .then((daten) => {

      setAutoList(daten);
    });
  }, []);

//Aufgaben für autos hinzufügen
  const aufgabeHinzufügen = () => {
    const neueAufgabenDaten = {
      id: Date.now(),
      title: neueAufgabe,
      fertig: false
    };

    setAufgabenListe([...aufgabenListe, neueAufgabenDaten]);
    setNeueAufgabe("");
    };
  
//autos hinzufügen wenn alle felder ausgefüllt wurden
  const autoHinzufuegen = async () => {

    if(!marke || !model || !submodel || !baujahr || !prioritaet) {
      setFehler("Bitte alle Felder asufüllen.");
      return;
    }

    setFehler("");

// ID zuweisen, daten erstellen und Pushen   
    const neueId = 
    autoList.length > 0
    ? Math.max(...autoList.map((auto) => auto.id)) + 1
    : 1

    const neuesAuto = {
      id: neueId,
      marke,
      model,
      submodel,
      baujahr,
      ankunft: new Date().toLocaleDateString(),
      prioritaet,
      aufgaben: aufgabenListe
    };

    const response = await fetch("http://localhost:3000/api/autos", {
      method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(neuesAuto)
  });

  const gespeichertesAuto = await response.json();

  setAutoList((alteAutos) => [...alteAutos, gespeichertesAuto]);

    setPopupOffen(false);
  }



  const ausgewaehltesAuto = autoList.find(
    (auto) => auto.id === ausgewaehlt?.id
  );

// Input felder leeren nach Hinzufügen oder schließen des Popups
  const popupSchließen = () => {
    setPopupOffen(false);
    setMarke("");
    setModel("");
    setSubmodel("");
    setBaujahr("");
    setPrioritaet("");
    setNeueAufgabe("");
    setAufgabenListe([]);
  };

  const detailsSchliessen = () => {
  setAusgewaehlt(null);
};

//Aufgaben als fertig markieren
const aufgabeUmschalten = async (aufgabe) => {
  const aktualisiertesAuto = {
    ...ausgewaehltesAuto,

    aufgaben: ausgewaehltesAuto.aufgaben.map((a) => {
      if (a.id === aufgabe.id) {
        return {
          ...a,
          fertig: !a.fertig
        };
      }

      return a;
    })
  };

  await autoAktualisieren(aktualisiertesAuto);
};


// useEffect zum speichern wenn Autos sich ändert

useEffect(() => {
    localStorage.setItem("werkstattAutos", JSON.stringify(autoList));
}, [autoList]);

//Auto aus liste entfernen + API eintrag löschen
const autoLoeschen = async (id) => {
  const response = await fetch(`http://localhost:3000/api/autos/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    console.error("Auto konnte nicht gelöscht werden.");
    return;
  }

  setAutoList((alteAutos) => {
    return alteAutos.filter((auto) => auto.id !== id);
  });
};

//auto aktualisieren
const autoAktualisieren = async (aktualisiertesAuto) => {
  const response = await fetch(`http://localhost:3000/api/autos/${aktualisiertesAuto.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(aktualisiertesAuto)
    }
  );

  if (!response.ok) {
    console.error("Auto konnte nicht aktualisiert werden.");
    return null;
  }

  const gespeichertesAuto = await response.json();

  setAutoList((alteAutos) => {
    return alteAutos.map((auto) =>
    auto.id === gespeichertesAuto.id 
    ? gespeichertesAuto
    : auto
  );
  });

  setAusgewaehlt(gespeichertesAuto);

  return gespeichertesAuto;
}

//aufgaben löschen
const bearbeitungsAufgabeLoeschen = (id) => {
  setBearbeitenAufgaben((alteAufgaben) => {
    return alteAufgaben.filter((aufgabe) => aufgabe.id !== id);
  });
};

//Aufgaben bearbeiten
const bearbeitungsAufgabeHinzufuegen = () => {
  if (!bearbeitenNeueAufgabe.trim()) {
    return;
  }

  const neueAufgabe = {
    id: Date.now(),
    title: bearbeitenNeueAufgabe,
    fertig: false
  };

  setBearbeitenAufgaben((alteAufgaben) => [
    ...alteAufgaben,
    neueAufgabe
  ]);

  setBearbeitenNeueAufgabe("");
};

//Grundlegender aufbau der seite
return (
  <div>
    <h1>Werkstatt</h1>

    <button onClick={() => setPopupOffen(true)}>Popup öffnen</button>
      
{/* // Popup zum hinzufügen von autos und aufgaben */}
{popupOffen && (
  <div className="overlay">
    <div className="popup">
      <h2>Auto Hinzufügen</h2>
        <form> 
          <input 
            type="text"
            placeholder="Marke"
            value={marke}
            onChange={(e) => setMarke(e.target.value)}/>

          <input 
            type="text"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}/>

          <input 
            type="text"
            placeholder="Submodel"
            value={submodel}
            onChange={(e) => setSubmodel(e.target.value)}/>

          <input 
            type="text"
            placeholder="Baujahr"
            value={baujahr}
            onChange={(e) => setBaujahr(e.target.value)}/>

          <select
            value={prioritaet}
            onChange={(e) => setPrioritaet(e.target.value)}>

            <option value="">Priorität auswählen</option>
            <option value="niedrig">Niedrig</option>
            <option value="mittel">Mittel</option>
            <option value="hoch">Hoch</option>
          </select>

        <div className="aufgaben-eingabe">
          <input 
            type="text" 
            placeholder="Neue Aufgabe" 
            value={neueAufgabe} 
            onChange={(e) => setNeueAufgabe(e.target.value)} />

          <button 
            type="button" 
            onClick={aufgabeHinzufügen}>
            Aufgabe hinzufügen
          </button>
        </div>
        </form>
          

{/* //Meldung bei nicht ausgefüllten Input feldern */}
        {fehler && (
          <div className="fehler-meldung">
            {fehler}
          </div>
        )}
{/* //hinzufügen und abbrechen des vorgangs */}
          <button 
           className="add-button"
           onClick={() => {
            autoHinzufuegen();
            popupSchließen();
           }}>
            Hinzufügen
          </button>

          <button 
          className="close-button"
          onClick={popupSchließen}>
            X
          </button>
    </div>
  </div>
)}
  
{/* //standart ansicht */}
  <div className="auto-grid">

    {autoList.map((auto) => (
      <div className="auto-item">
            
          <div className="auto-card"
          onClick={() => {
            console.log("Karte geklickt:, auto");
            setAusgewaehlt(auto);
          }}
          >

            <div className="auto-title">
              <h2>{auto.marke}</h2>
              <h3> {auto.model} {auto.submodel}</h3>
            </div>

            <div className="auto-info">
              <div className="auto-info-item">
                <span>Baujahr</span>
                <strong>{auto.baujahr}</strong>
              </div>

              <div className="auto-info-item">
                <span>Ankunft</span>
                <strong>{auto.ankunft}</strong>
              </div>

              <div className="auto-info-item">
                <span>Priorität</span>
                <strong>{auto.prioritaet}</strong>
              </div>

              <div className="auto-info-item">
                <span>Aufgaben</span>
                <strong>
                {auto.aufgaben.filter((aufgabe) => aufgabe.fertig).length} von {auto.aufgaben.length}
                </strong>
              </div>
           </div>
             <button
              className="delete"
              onClick={(e) => {
              e.stopPropagation();
               autoLoeschen(auto.id);
              }}
              >
              Löschen
              </button>
            </div>
          </div>
    ))}
  </div>

{/* //detail ansicht */}
      {ausgewaehlt && (

        <div className="overlay">

          <div className="detail-view">
       
            <div className="detail-auto">
                <h2>{ausgewaehltesAuto.marke}</h2>
                  <h3>
                    {ausgewaehltesAuto.model} {ausgewaehltesAuto.submodel}
                  </h3>

                </div>

                <div className="detail-info">

                  <div className="detail-info-item">
                    <span>Baujahr</span>
                    <strong>{ausgewaehltesAuto.baujahr}</strong>
                  </div>

                  <div className="detail-info-item">
                    <span>Ankunft</span>
                    <strong>{ausgewaehltesAuto.ankunft}</strong> 
                  </div>

                  <div className="detail-info-item">
                    <span>Priorität</span>
                    <strong className={`prioritaet-${ausgewaehltesAuto.prioritaet}`}>
                      {ausgewaehltesAuto.prioritaet}
                     </strong>
                  </div>

                  <div className="detail-info-item">
                    <span>Aufgaben</span>
                    <strong>
                    {ausgewaehltesAuto.aufgaben.filter((aufgabe) => aufgabe.fertig).length} von {ausgewaehltesAuto.aufgaben.length}
                    </strong>
                  </div>
            </div>

{/* Aufgaben als erledigt makieren */}

              <div className="detail-aufgaben">

                {ausgewaehltesAuto.aufgaben.map((aufgabe) => (
                  <div key={aufgabe.id}>

                    <input 
                      type='checkbox' 
                      checked={aufgabe.fertig}
                      onChange={() => {
                      aufgabeUmschalten(aufgabe)
                      }}
                    />
                    <h3>{aufgabe.title}</h3>
                  </div>
        
      ))}

        </div>

{/* Schhließen der detail ansicht */}

  <button className="detail-button"
  onClick={detailsSchliessen}
  >
  X
  </button>

{/* button zum bearbeiten der details */}

  <button className="bearbeiten-button"
  onClick={() => {
    setBearbeitenMarke(ausgewaehlt.marke);
    setBearbeitenModel(ausgewaehlt.model);
    setBearbeitenSubmodel(ausgewaehlt.submodel);
    setBearbeitenPrioritaet(ausgewaehlt.pioritaet);
    setBearbeitenAufgaben(ausgewaehlt.aufgaben);
    setBearbeitenBaujahr(ausgewaehlt.baujahr);
    setBearbeitenPrioritaet(ausgewaehltesAuto.prioritaet);

    setBearbeiten(true)
  }}
  >
    bearbeiten
  </button>


{/* Bearbeitungs popup */}
{bearbeiten&& (
  <div className="overlay">
    <div className="bearbeiten-popup">
      <h2>Fahrzeug bearbeiten</h2>

      <input
        type="text"
        value={bearbeitenMarke}
        onChange={(e) => setBearbeitenMarke(e.target.value)}
        placeholder="Marke"
      />

      <input
        type="text"
        value={bearbeitenModel}
        onChange={(e) => setBearbeitenModel(e.target.value)}
        placeholder="Modell"
      />

      <input
        type="text"
        value={bearbeitenSubmodel}
        onChange={(e) => setBearbeitenSubmodel(e.target.value)}
        placeholder="Submodell"
      />

      <input
        type="number"
        value={bearbeitenBaujahr}
        onChange={(e) => setBearbeitenBaujahr(e.target.value)}
        placeholder="Baujahr"
      />

      <select
        value={bearbeitenPrioritaet}
        onChange={(e) => setBearbeitenPrioritaet(e.target.value)}
      >
        <option value="">Priorität auswählen</option>
        <option value="niedrig">Niedrig</option>
        <option value="mittel">Mittel</option>
        <option value="hoch">Hoch</option>
      </select>

      <h3>Aufgaben</h3>

<div className="bearbeiten-aufgaben">
  {bearbeitenAufgaben.map((aufgabe) => (
    <div
      key={aufgabe.id}
      className="bearbeiten-aufgabe"
    >
      <input
        type="checkbox"
        checked={aufgabe.fertig}
        onChange={() => {}}
      />

      <span>{aufgabe.title}</span>

        <button
          type="button"
          className="aufgabe-loeschen"
          onClick={() => bearbeitungsAufgabeLoeschen(aufgabe.id)}
          >
          Löschen
        </button>
    </div>
  ))}
</div>

<div className="bearbeiten-aufgaben-eingabe">
  <input
    type="text"
    value={bearbeitenNeueAufgabe}
    onChange={(e) => setBearbeitenNeueAufgabe(e.target.value)}
    placeholder="Neue Aufgabe"
  />

    <button
      type="button"
      onClick={bearbeitungsAufgabeHinzufuegen}
      >
      Aufgabe hinzufügen
    </button>
</div>

      <button
        type="button"
        className="speichern-button"
        onClick={async () => {
          const aktualisiertesAuto = {
            ...ausgewaehlt,
            marke: bearbeitenMarke,
            model: bearbeitenModel,
            submodel: bearbeitenSubmodel,
            baujahr: bearbeitenBaujahr,
            prioritaet: bearbeitenPrioritaet,
            aufgaben: bearbeitenAufgaben
          };

          await autoAktualisieren(aktualisiertesAuto);

          setBearbeiten(false);
        }}
      >
        Speichern
      </button>

      <button
  className="close-button"
  onClick={() => setBearbeiten(false)}
>
  X
</button>
    </div>
  </div>
)}
              </div>

            </div>
      )}
          </div>
  );
}
                      
export default App 
