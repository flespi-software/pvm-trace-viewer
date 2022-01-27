import React, { ChangeEvent } from 'react';
import { TTraceDump, TTraceFile } from '../../types';
import './style.css';

interface TraceDumpSelectorProps {
	setTraceFile: (file: TTraceFile) => void;
	setTraceDump: (dump: TTraceDump) => void;
}

const TraceDumpSelector: React.FC<TraceDumpSelectorProps> = (props) => {

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const fileReader = new FileReader();
			const file = e.target.files[0];
			fileReader.readAsText(file, 'UTF-8');
			props.setTraceFile({ name: file.name, size: file.size });
			fileReader.onload = (e) => {
				if (e.target?.result) {
					const fileJson = e.target.result.toString();
					const traceDump: TTraceDump = JSON.parse(fileJson);
					if (traceDump.source) {
						traceDump.sourceLines = {};
						for (let key of Object.keys(traceDump.source)) {
							const lines = traceDump.source[key].split('\n');
							traceDump.sourceLines[key] = lines;
						}
					}
					props.setTraceDump(traceDump);
				}
			};
		}
	};

	return (
		<header className="trace-dump-header">
			<span>
				Load trace dump: (here is a <a href='/pvm-trace-viewer/demo.json' download={true}>demo.json</a>)
			</span>
			<input type="file" onChange={handleChange}/>
		</header>
	);
};

export default TraceDumpSelector;
