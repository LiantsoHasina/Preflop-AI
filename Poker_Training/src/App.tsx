import './App.css'
import { PokerPreflopTrainer } from './components';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <PokerPreflopTrainer />
    </AuthProvider>
  )
}

export default App
