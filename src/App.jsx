import { useState, useEffect } from 'react';
import { autos } from './data.js';
import './App.css';

function App() {
  


  const [marke, setMarke] = useState("");
  const [model, setModel] = useState("");
  const [submodel, setSubmodel] = useState("");
  const [baujahr, setBaujahr] = useState("");
  const [priorität, setPriorität] = useState("");
  const [popupOffen, setPopupOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState(null);
  const [neueAufgabe, setNeueAufgabe] = useState("");
  const [aufgabenListe, setAufgabenListe] = useState([]);
  const [fehler, setFehler] = useState("");

  const aufgabeHinzufügen = () => {
    const neueAufgabenDaten = {
      id: Date.now(),
      title: neueAufgabe,
      fertig: false
    };

    setAufgabenListe([...aufgabenListe, neueAufgabenDaten]);
    setNeueAufgabe("");
    };
  
      // autos hinzufügen

  const autoHinzufuegen = () => {

    if(!marke || !model || !submodel || !baujahr || !priorität) {
      setFehler("Bitte alle Felder asufüllen.");
      return;
    }

    setFehler("");

    const neuesAuto = {
      id: aufgabenListe.length + 1,
      marke,
      model,
      submodel,
      baujahr,
      ankunft: new Date().toLocaleDateString(),
      priorität,
      aufgaben: aufgabenListe
    };

    setAutoList((alteAutos) => [...alteAutos, neuesAuto]);
    setPopupOffen(false);
  }

  const [autoList, setAutoList] = useState(() => {
  const gespeicherteAutos = localStorage.getItem("werkstattAutos");

    if (gespeicherteAutos) {
      return JSON.parse(gespeicherteAutos);
    }

    return autos;
  });

  const ausgewaehltesAuto = autoList.find(
    (auto) => auto.id === ausgewaehlt?.id
  );


  const popupSchließen = () => {
    setPopupOffen(false);
    setMarke("");
    setModel("");
    setSubmodel("");
    setBaujahr("");
    setPriorität("");
    setNeueAufgabe("");
    setAufgabenListe([]);
  };

  const detailsSchliessen = () => {
  setAusgewaehlt(null);
};


  const aufgabeUmschalten = (aufgabe) => {
    setAutoList((alteAutos) => {
      return alteAutos.map((auto) => {
        if (auto.id === ausgewaehltesAuto.id) {
          return {
            ...auto,
            aufgaben: auto.aufgaben.map((a) => {
              if (a.id === aufgabe.id) {
                return {
                  ...a,
                  fertig: !a.fertig
                };
              }
              return a;
            })
          };
        }
        return auto;
      })
    })
  }


// useEffect zum speichern wenn Autos sich ändert

useEffect(() => {
    localStorage.setItem("werkstattAutos", JSON.stringify(autoList));
}, [autoList]);

// popup öffnen und schließen + details anzeigen und aufgabe hinzufügen
console.log(autoList);

const autoLoeschen = (id) => {
  setAutoList((alteAutos) => {
    return alteAutos.filter((auto) => auto.id !== id);
  });
};


  return (
   <div>
      <h1>Werkstatt</h1>

      <button onClick={() => setPopupOffen(true)}>Popup öffnen</button>
      

  {popupOffen && (
    <div className="overlay">
      <div className="popup">
        <h2>Auto Hinzufügen</h2>
          <form> 
            <input 
              type="text"
              placeholder="Marke"
              value={marke}
              onChange={(e) => setMarke(e.target.value)}
            />

            <input 
              type="text"
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />

            <input 
              type="text"
              placeholder="Submodel"
              value={submodel}
              onChange={(e) => setSubmodel(e.target.value)}
            />

            <input 
              type="text"
              placeholder="Baujahr"
              value={baujahr}
              onChange={(e) => setBaujahr(e.target.value)}
            />

            <select
              value={priorität}
              onChange={(e) => setPriorität(e.target.value)}
            >

              <option value="">Priorität auswählen</option>
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
            </select>

            <input type="text" 
              placeholder="Neue Aufgabe" 
              value={neueAufgabe} 
              onChange={(e) => setNeueAufgabe(e.target.value)} />
              <button type="button" onClick={aufgabeHinzufügen}>
              Aufgabe hinzufügen
              </button>
          </form>
          
          {fehler && (
            <div className="fehler-meldung">
            {fehler}
     </div>
   )}

          <button 
           className="add-button"
           onClick={autoHinzufuegen}>
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

  <div className="auto-grid">

    {autoList.map((auto) => (
      <div className="auto-item">
      
        {ausgewaehlt?.id === auto.id ? (

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
                    <strong>{ausgewaehltesAuto.priorität}</strong>
                  </div>

                  <div className="detail-info-item">
                    <span>Aufgaben</span>
                    <strong>
                    {auto.aufgaben.filter((aufgabe) => aufgabe.fertig).length} von {auto.aufgaben.length}
                    </strong>
                  </div>
              </div>

              <div className="detail-aufgaben">

                {ausgewaehltesAuto.aufgaben.map((aufgabe) => (
                  <div key={aufgabe.id}>

                    <h3>{aufgabe.title}</h3>

                      <input
                        type='checkbox' 
                        checked={aufgabe.fertig}
                        onChange={() => {
                        aufgabeUmschalten(aufgabe)
                       }}
                      />

                  </div>

                ))}
<button className="detail-button"
onClick={detailsSchliessen}
>
  X
</button>
              </div>

            </div>

            
            ) : (

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
                <strong>{auto.priorität}</strong>
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

            )}
          </div>
    ))}
  </div>


</div>
  );
}


export default App 
