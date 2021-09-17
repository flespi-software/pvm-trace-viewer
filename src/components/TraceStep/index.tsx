import React from 'react';
import { getDataSize, TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType, TVariableAction } from '../../types';
import TimeString from '../TimeString';
import { scrollTo } from '../../lib/common';
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
		return v ? v[1] : "?";
	}

	const listVars = (vars: TVariableAction[]) => {
		return vars.map((v, index) => {
			if (typeof v === "number")
				return <span key={index} className="trace-var">UNSET ${getVarName(v)}</span>;
			else
				return <span key={index} className="trace-var">${getVarName(v[0])} = {v[2]}</span>
		})
	}

	const fileIndexToSourceName = (file: number): string | null => {
		const fileId = traceDump.files.find((fId) => fId[0] === file);
		if (!fileId)
			return null;
		const fileName = fileId[1];
		if (fileName === traceDump.bytecode_name)
			return 'main';
		return fileName;
	}

	const displaySourceCodeLine = (file: number, lineNum: number) => {
		if (!traceDump.sourceLines)
			return '?';
		const sourceName = fileIndexToSourceName(file);
		if (!sourceName)
			return '?';
		const lines = traceDump.sourceLines[sourceName];
		const line = lines[lineNum - 1];
		return line.trim();
	}

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
				{displaySourceCodeLine(step.c[0], step.c[1])}
			</div>
		</div>
		break;
	case TTraceStepType.NewData:
		const size = getDataSize(step);
		body = <div>
			<div className="trace-step-data">
				<div className="trace-step-data-column">
					{size > 20 ? step.d.slice(0, 40) + "..." : step.d}
				</div>
				<div className="trace-step-data-column">
					{size} bytes,&nbsp;<TimeString value={step.tm} />
				</div>
			</div>
			<div className="trace-step-source-line">
				{displaySourceCodeLine(step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	case TTraceStepType.Offset:
		body = <div>
			<div className="trace-step-data">
				<div className="trace-step-data-column">
					{packetStep && <span>&nbsp;&nbsp;{ packetStep.d.slice(step.l * 2, step.o * 2) }</span>}
				</div>
				<div className="trace-step-data-column">
					{step.o - step.l} bytes: {step.l}...{step.o}
				</div>
			</div>
			<div className="trace-step-source-line">
				{displaySourceCodeLine(step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	case TTraceStepType.Error:
		body = <div>
			Error:
			<pre className="trace-step-error">{step.m}</pre>
			<div className="trace-step-source-line">
				{displaySourceCodeLine(step.c[0], step.c[1])}
			</div>
		</div>;
		break;
	}

	return (
		<div
			key={index}
			ref={index === stepIndex ? scrollTo : undefined}
			className={index === stepIndex ? "trace-step trace-step-selected" : "trace-step"}
			onClick={() => stepClick(index)}>
			{body}
		</div>
	);
};

export default TraceStep;
