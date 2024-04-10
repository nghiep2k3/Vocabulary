import React from "react";
import { Route,Routes, Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Test from "./components/Test/Test";

function App() {
  return (
    <div style={{ background: "black", height: "100vh" }}>
      <Header /> {/* Đảm bảo component Header được bao bọc bởi <Router> */}
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
        <Outlet/>
      </div>
    </div>
  );
}

export default App;
