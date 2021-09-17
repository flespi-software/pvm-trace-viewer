import { useState } from 'react';
import { TTraceDump, TTraceFile } from './types';
import TraceDumpViewer from './components/TraceDumpViewer';
import TraceDumpSelector from './components/TraceDumpSelector';
import './App.css';

function App() {
	const [traceFile, setTraceFile] = useState<TTraceFile>();
	const [traceDump, setTraceDump] = useState<TTraceDump>();

	console.log('traceFile, traceDump', traceFile, traceDump);

	return (
		<div className="App">
			{ (traceDump && traceFile) ? (
				<TraceDumpViewer traceFile={traceFile} traceDump={traceDump} />
			) : (
				<TraceDumpSelector setTraceFile={setTraceFile} setTraceDump={setTraceDump} />
			)}
		</div>
	);
}

export default App;
