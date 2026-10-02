import { useState } from "react";
import "./App.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");

  const anmelden = async (event) => {
    event.preventDefault();

    setFehler("");

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          passwort
        })
      });

      const daten = await response.json();

      if (!response.ok) {
        setFehler(daten.error);
        return;
      }

      console.log("Erfolgreich angemeldet:", daten.benutzer);

      onLogin();

    } catch (error) {
      console.error(error);

      setFehler(
        "Der Server ist momentan nicht erreichbar."
      );
    }
  };

  return (
    <div className="login-seite">

      <div className="login-box">

        <h1 className="login-header">Werkstatt</h1>

        <h2 className="login-title">Anmelden</h2>

        <form onSubmit={anmelden} className="login-form">

          <input className="login-input"
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input className="login-input"
            type="password"
            placeholder="Passwort"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
          />

          {fehler && (
            <div className="fehler-meldung">
              {fehler}
            </div>
          )}

          <button type="submit" className="login-button">
            Anmelden
          </button>

        </form>

        <h3>Sie sind Mitarbeiter?</h3>

        <button type="button" className="mitarbeiter-login">
            zum Mitarbeiter Login
        </button>

      </div>

    </div>
  );
}

export default Login;