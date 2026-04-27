import { useEffect } from 'react';
import JobsList from './components/JobsList';

function App() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <JobsList />;
}

export default App;
