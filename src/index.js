import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Lesson from "./components/Lesson/Lesson";
import ListWord from "./components/ListWord/ListWord";
import Dev from "./components/Dev/Dev";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          {/* <Route index element={<Objectquiz />} /> */}
          <Route path="/Objectquiz/:quiz" element={<Objectquiz />} />
        </Route>

        <Route  path="Lesson" element={<Lesson />} />
        <Route  index element={<Lesson />} />
        <Route path="/ListWord" element={<ListWord />} />
        <Route path="/Dev" element={<Dev />} />
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
