import logo from './logo.svg';
import {Routes,Route} from "react-router-dom";
import './App.css';
import Lobbyscreen from './screens/lobby';
import RoomPage from './screens/Room';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Lobbyscreen/>}/>
        <Route path='/room/:roomId' element={<RoomPage/>}/>
      </Routes>
     
    </div>
  );
}

export default App;
