import { Routes, Route } from 'react-router-dom';
import './App.css';
import Welcome from './screens/Welcome';
// import Tutorial from './screens/Tutorial';
// import Home from './screens/Home';
// import Fight from './screens/Fight';
// import MiniGames from './screens/MiniGames';
// import Account from './screens/Account';
// import Settings from './screens/Settings';
// import Score from './screens/Score';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      {/* <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/home" element={<Home />} />
      <Route path="/fight" element={<Fight />} />
      <Route path="/minigames" element={<MiniGames />} />
      <Route path="/account" element={<Account />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/score" element={<Score />} /> */}
    </Routes>
  );
}

export default App;
