import React from 'react';
import { scrollTo } from '../../lib/common';
import { TTraceDump } from '../../types';
import './style.css';

interface SourceCodeViewProps {
	traceDump: TTraceDump;
	stepIndex: number;
}

const SourceCodeView: React.FC<SourceCodeViewProps> = (props) => {
	const { traceDump, stepIndex } = props;
	const step = traceDump.trace[stepIndex];
	const fileLines = traceDump.sourceLines?.main; // NOTE: hardcoded "main" source code file

	if (!fileLines)
		return <div>no source code available</div>;

	const lines = fileLines.map((line, index) => {
		let viewLine
		if (line === '')
			viewLine = <br />;
		else
			viewLine = line;

		return <pre
			key={index}
			ref={index === (step.c[1] - 1) ? scrollTo : undefined}
			className={index === (step.c[1] - 1) ? 'source-code-line source-code-line-selected': 'source-code-line'}>{viewLine}</pre>
	});

	return <div className="source-code-lines">
		{lines}
	</div>
};

export default SourceCodeView;
