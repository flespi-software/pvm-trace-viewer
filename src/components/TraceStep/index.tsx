import React from 'react';
import { getDataSize, TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType, TVariableAction } from '../../types';
import TimeString from '../TimeString';
import { getSourceCodeLine, renderDecodedHex, scrollTo } from '../../lib/common';
import './style.css';

interface TraceStepProps {
	traceDump: TTraceDump;
	stepIndex: number;
	index: number;
	packetStep?: TTraceStepNewData;
	setStepIndex: (index: number) => void;
	step: TTraceStep;
	decodeHex: boolean;
}

const TraceStep: React.FC<TraceStepProps> = (props) => {
	const { traceDump, stepIndex, index, packetStep, setStepIndex, step, decodeHex } = props;
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
				<span className="trace-step-data-column trace-step-data-column-value">
					{decodeHex ? renderDecodedHex(step.d) : step.d}
				</span>
				<span className="trace-step-data-column">
					<small>{size} bytes,&nbsp;<TimeString value={step.tm} /></small>
				</span>
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
				<span className="trace-step-data-column trace-step-data-column-value">
					{packetStep && <>&nbsp;&nbsp;{
						decodeHex ? renderDecodedHex(packetStep.d.slice(step.l * 2, step.o * 2)) : packetStep.d.slice(step.l * 2, step.o * 2)
					}</>}
				</span>
				<span className="trace-step-data-column">
					<small>{step.o - step.l} bytes: {step.l}...{step.o}</small>
				</span>
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
