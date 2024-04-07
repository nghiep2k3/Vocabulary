import logo from "./logo.svg";
import "./App.css";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Header from "./components/Header/Header";

function App() {
  return (
    <div style={{ background: "black", height: "100vh" }}>
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
        <Objectquiz></Objectquiz>
      </div>
    </div>
  );
}

export default App;
