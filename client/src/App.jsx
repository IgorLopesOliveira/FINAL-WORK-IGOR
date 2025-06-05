import { Routes, Route } from 'react-router-dom';
import './App.css';
import './i18n';

import Welcome from './screens/Welcome';
import Tutorial from './screens/Tutorial';
import Home from './screens/Home';
import Fight from './screens/Fight';
import MiniMenu from './screens/MiniMenu';
import Memorize from './screens/Memorize';
import Accuracy from './screens/Accuracy';
import Account from './screens/Account';
import Settings from './screens/Settings';
import Score from './screens/Score';

import { SocketProvider } from './context/SocketContext';


function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/fight" element={<Fight />} />
        <Route path="/minimenu" element={<MiniMenu />} />
        <Route path="/memorize" element={<Memorize />} />
        <Route path="/accuracy" element={<Accuracy />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/score" element={<Score />} /> 
      </Routes>
    </SocketProvider>
  );
}

export default App;
