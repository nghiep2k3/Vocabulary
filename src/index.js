import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Test from "./components/Test/Test";
import ListWord from "./components/ListWord/ListWord";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Objectquiz />} />
          <Route path="Objectquiz" element={<Objectquiz />} />
          <Route path="Test" element={<Test />} />
        </Route>

        <Route path="/ListWord" element={<ListWord />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

/* dùng chung header 
  <Route path="/"  element={<App />} >
      <Route path="/Test"  element={<Test />} />
  </Route>

*/

/*Không dùng chung header 
  <Route path="/"  element={<App />} />
  <Route path="/Test"  element={<Test />} />

*/
reportWebVitals();
