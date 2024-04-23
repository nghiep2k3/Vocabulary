import React, { useState } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Test from "./components/Lesson/Lesson";
import styles from "./index.css";

function App() {
  return (
    <div className={styles.App}>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "purple",
          borderRadius: "20px",
          height: "600px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default App;
