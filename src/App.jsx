import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import PDFCustomizationApp from "./PDFCustomizationApp";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <PDFCustomizationApp />
    </>
  );
}

export default App;
