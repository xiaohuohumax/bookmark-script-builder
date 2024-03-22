import HelloWorld from './components/HelloWorld.jsx';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  return (
    <>
      <div className="bookmark-script-app">
        <img src={reactLogo} className="logo" alt="Vue logo" />
        <HelloWorld />
      </div>
    </>
  );
}

export default App;
