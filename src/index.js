import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Lesson from "./components/Lesson/Lesson";
import ListWord from "./components/ListWord/ListWord";
import Result from "./components/Result/Result";
import Testquiz from "./components/TestQuiz/Testquiz";
import Dev from "./components/Dev/Dev";
import { AudioProvider } from "./AudioContext";

const Root = () => {
  return (
    <AudioProvider>
      <Router>
        <div style={{ background: "black", height: "100vh" }}>
          <Routes>
            <Route path="/" element={<App />}>
              {/* <Route index element={<Objectquiz />} /> */}
              <Route path="/Objectquiz/:quiz" element={<Objectquiz />} />
              <Route path="Result" element={<Result />} />
              <Route path="/Testquiz" element={<Testquiz />} />
            </Route>
            <Route path="/Result" element={<Result />} />
            <Route path="/Lesson" element={<Lesson />} />
            <Route index element={<Lesson />} />
            <Route path="/ListWord" element={<ListWord />} />
            <Route path="/Dev" element={<Dev />} />
          </Routes>
        </div>
      </Router>
    </AudioProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
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
