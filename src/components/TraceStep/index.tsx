import React from 'react';
import { getDataSize, TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType, TVariableAction } from '../../types';
import TimeString from '../TimeString';
import { getSourceCodeLine, scrollTo } from '../../lib/common';
import './style.css';

interface TraceStepProps {
	traceDump: TTraceDump;
	stepIndex: number;
	index: number;
	packetStep?: TTraceStepNewData;
	setStepIndex: (index: number) => void;
	step: TTraceStep;
}

const TraceStep: React.FC<TraceStepProps> = (props) => {
	const { traceDump, stepIndex, index, packetStep, setStepIndex, step } = props;
	const { variables } = traceDump;

	const getVarName = (index: number) => {
		const v = variables.find((varId) => varId[0] === index);
		return v ? v[1] : '?';
	};

	const listVars = (vars: TVariableAction[]) => {
		return vars.map((v, index) => {
			if (typeof v === 'number')
				return <span key={index} className="trace-var">UNSET ${getVarName(v)}</span>;
			else
				return <span key={index} className="trace-var">${getVarName(v[0])} = {v[2]}</span>;
		});
	};

	const stepClick = (index: number) => {
		setStepIndex(index);
	};

	let body;

	switch (step.t) {
	case TTraceStepType.Line:
		body = <div>
			<div>
				{listVars(step.v)}
			</div>
			<div className="trace-step-source-line">
				{getSourceCodeLine(traceDump, step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	case TTraceStepType.NewData: {
		const size = getDataSize(step);
		body = <div>
			<div className="trace-step-data">
				<div className="trace-step-data-column">
					<strong>{size > 20 ? step.d.slice(0, 40) + '...' : step.d}</strong>
				</div>
				<div className="trace-step-data-column">
					<small>{size} bytes,&nbsp;<TimeString value={step.tm} /></small>
				</div>
			</div>
			<div className="trace-step-source-line">
				{getSourceCodeLine(traceDump, step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	}
	case TTraceStepType.Offset:
		body = <div>
			<div className="trace-step-data">
				<div className="trace-step-data-column">
					<strong>{packetStep && <span>&nbsp;&nbsp;{ packetStep.d.slice(step.l * 2, step.o * 2) }</span>}</strong>
				</div>
				<div className="trace-step-data-column">
					<small>{step.o - step.l} bytes: {step.l}...{step.o}</small>
				</div>
			</div>
			<div className="trace-step-source-line">
				{getSourceCodeLine(traceDump, step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	case TTraceStepType.Error:
		body = <div>
			Error:
			<pre className="trace-step-error">{step.m}</pre>
			<div className="trace-step-source-line">
				{getSourceCodeLine(traceDump, step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	}

	return (
		<div
			key={index}
			ref={index === stepIndex ? scrollTo : undefined}
			className={index === stepIndex ? 'trace-step trace-step-selected' : 'trace-step'}
			onClick={() => stepClick(index)}>
			{body}
		</div>
	);
};

export default TraceStep;
