import { useEffect } from 'react';
import JobsList from './components/JobsList';
import { AccessGate } from './components/AccessGate/AccessGate';

function App() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <AccessGate>
      <JobsList />
    </AccessGate>
  );
}

export default App;
