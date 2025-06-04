import React from 'react';
import { TTraceDump } from '../../types';
import { getFileName } from '../../lib/common';

interface SourceCodeViewProps {
	traceDump: TTraceDump;
	stepIndex: number;
}

const SourceCodeFile: React.FC<SourceCodeViewProps> = (props) => {
	const { traceDump, stepIndex } = props;
	const step = traceDump.trace[stepIndex];
	const fileIndex = step.c[0];
	const fileName = getFileName(traceDump, stepIndex) || fileIndex.toString();

	return <strong>{fileName || fileIndex}</strong>;
};

export default SourceCodeFile;
