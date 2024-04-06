import logo from "./logo.svg";
import "./App.css";
import Objectquiz from "./components/ObjectQuiz/Objectquiz";
import Header from "./components/Header/Header";

function App() {
  return (
    <div style={{background: 'black'}}>
      <Header/>
      <Objectquiz></Objectquiz>
    </div>
  );
}

export default App;
