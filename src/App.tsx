import { Layout } from './components/Layout';
import { SoundTest } from './components/SoundTest';
import { ParentBridgeProvider } from './context/ParentBridgeContext';

function App() {
  const isSoundTest = typeof window !== 'undefined' && window.location.search.includes('soundtest=1');

  return (
    <ParentBridgeProvider>
      {isSoundTest ? <SoundTest /> : <Layout />}
    </ParentBridgeProvider>
  );
}

export default App;
