import _ from 'lodash';
import React, { ChangeEvent } from 'react';
import { useState } from 'react';
import { TTraceDump, TTraceFile, TTraceStepType } from '../../types';
import SourceCodeView from '../SourceCodeView';
import TraceDumpSteps from '../TraceDumpSteps';
import TracePacket from '../TracePacket';
import './style.css';

interface TraceDumpViewerProps {
	traceFile: TTraceFile;
	traceDump: TTraceDump;
}

const TraceDumpViewer: React.FC<TraceDumpViewerProps> = (props) => {
	const { traceFile, traceDump } = props;
	const [packetIndex, setPacketIndex] = useState(-1);
	const [stepIndex, setStepIndex] = useState(0);
	const [showAllSteps, setShowAllSteps] = useState(false);

	const setPacket = (index: number) => {
		setPacketIndex(index);
		setStepIndex(index);
	}

	const setStep = (index: number) => {
		if (index < 0)
			index = traceDump.trace.length - 1;
		else if (index >= traceDump.trace.length)
			index = 0;
		setStepIndex(index);
		// find a packet index to the left of the selected step index
		const packetIndex = _.findLastIndex(traceDump.trace, (step) => step.t === TTraceStepType.NewData, index);
		if (packetIndex !== -1)
			setPacketIndex(packetIndex);
	}

	const showAllStepsChanged = (e: ChangeEvent<HTMLInputElement>) => {
		setShowAllSteps(e.target.checked);
	}

	const prevStep = (index: number) => {
		if (showAllSteps)
			return index - 1;
		else {
			let prev = _.findLastIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, index - 1);
			if (prev === -1)
				prev = _.findLastIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, traceDump.trace.length - 1);
			return prev;
		}
	}

	const nextStep = (index: number) => {
		if (showAllSteps)
			return index + 1;
		else {
			let next = _.findIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, index + 1);
			if (next === -1)
				next = _.findIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, 0);
			return next;
		}
	}

	return (
		<>
			<div className="trace-file-info">
				Loaded trace dump file <strong>{traceFile.name}</strong> of size <strong>{Number(traceFile.size / 1024).toFixed(2)}</strong> KiB
			</div>
			<TracePacket traceDump={traceDump} packetIndex={packetIndex} setPacketIndex={setPacket} stepIndex={stepIndex} setStepIndex={setStep} />
			<div className="trace-view-settings">
				<button onClick={() => setStep(prevStep(stepIndex))}>&lt;</button>
				<button onClick={() => setStep(nextStep(stepIndex))}>&gt;</button>
				&nbsp;
				<label>show all steps: <input type="checkbox" onChange={showAllStepsChanged} /></label>
			</div>
			<div className="trace-dump-details">
				<TraceDumpSteps traceDump={traceDump} stepIndex={stepIndex} setStepIndex={setStep} showAllSteps={showAllSteps} />
				<SourceCodeView traceDump={traceDump} stepIndex={stepIndex} />
			</div>
		</>
	);
};

export default TraceDumpViewer;
