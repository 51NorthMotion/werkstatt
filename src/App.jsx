import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [eingeloggt, setEingeloggt] = useState(false);

  if (!eingeloggt) {
    return (
      <Login onLogin={() => setEingeloggt(true)} />
    );
  }

  return <Dashboard />;
}

export default App;