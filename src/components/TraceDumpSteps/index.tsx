import React from 'react';
import { TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType } from '../../types';
import TraceStep from '../TraceStep';
import './style.css';

interface TraceDumpStepsProps {
	traceDump: TTraceDump;
	stepIndex: number;
	setStepIndex: (index: number) => void;
	showAllSteps: boolean;
}

const TraceDumpSteps: React.FC<TraceDumpStepsProps> = (props) => {
	const { trace } = props.traceDump;
	const { stepIndex, setStepIndex, showAllSteps } = props;

	const step = trace[stepIndex] as TTraceStep;
	console.log('step', step);

	let packetStep: TTraceStepNewData;

	const steps: React.ReactElement[] = [];
	trace.forEach((step, index) => {
		if (step.t === TTraceStepType.NewData)
			packetStep = step;
		if (showAllSteps || (step.t !== TTraceStepType.Line))
			steps.push(<TraceStep key={index} traceDump={props.traceDump} stepIndex={stepIndex} index={index} packetStep={packetStep} setStepIndex={setStepIndex} step={step} />);
	});

	return (
		<div className="trace-dump-steps">
			{steps}
		</div>
	)
};

export default TraceDumpSteps;
