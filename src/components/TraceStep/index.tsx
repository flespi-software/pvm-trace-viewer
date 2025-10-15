import React from 'react';
import { Buffer } from 'buffer';
import { getDataSize, TInteropName, TIOValueDbuf, TIOValueJson, TOperationActionBase, TOperationActionInterop, TOperationActionParam, TOperationType, TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType, TVariableAction } from '../../types';
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
				return <span key={'var-' + index} className="trace-var">UNSET ${getVarName(v)}</span>;
			else
				return <span key={'var-' + index} className="trace-var">${getVarName(v[0])} = {v[2]}</span>;
		});
	};

	const listOps = (ops: TOperationActionBase[]) => {
		return ops.map((op, index) => {
			switch (op.t) {
			case TOperationType.Param: {
				const p = (op as TOperationActionParam);
				return <span key={'op-' + index} className="trace-op">#{p.n} = {JSON.stringify(p.v)}</span>;
			}
			case TOperationType.Interop: {
				const i = (op as TOperationActionInterop);
				switch (i.o) {
				case TInteropName.Login: {
					const args = (i.a as TIOValueJson);
					const result = (i.r as TIOValueJson);
					return <span key={'op-' + index} className="trace-op">Login: {JSON.stringify(args.v)}{result?.v && ` ==> ${JSON.stringify(result.v)}`}</span>;
				}
				case TInteropName.Send: {
					const args = (i.a as TIOValueDbuf);
					const size = args.v.length / 2;
					return <span key={'op-' + index} className="trace-op">Send {size} bytes: {decodeHex ? renderDecodedHex(args.v) : args.v}</span>;
				}
				case TInteropName.RegisterMessage: {
					const args = (i.a as TIOValueJson);
					return <span key={'op-' + index} className="trace-op">Register message: {JSON.stringify(args.v)}</span>;
				}
				case TInteropName.WarningLog: {
					const log = i.p;
					const args = (i.a as TIOValueJson);
					let data_hex;
					if (args.v?.data) {
						data_hex = Buffer.from(args.v?.data, 'base64').toString('hex').toUpperCase();
					}
					return <span key={'op-' + index} className="trace-op">
						Warning: {log}
						{data_hex && <><br/> Data: {decodeHex ? renderDecodedHex(data_hex) : data_hex}</>}
					</span>;
				}
				case TInteropName.SettingSet: {
					const setting = i.p;
					const args = (i.a as TIOValueJson);
					return <span key={'op-' + index} className="trace-op">
						Setting {setting} set: {JSON.stringify(args.v)}
					</span>;
				}
				case TInteropName.SettingsMerge: {
					const args = (i.a as TIOValueJson);
					return <span key={'op-' + index} className="trace-op">
						Settings merge: {JSON.stringify(args.v)}
					</span>;
				}
				case TInteropName.CommandResult: {
					const args = (i.a as TIOValueJson);
					args.v.flags = undefined;
					args.v.id = undefined;
					args.v.item_id = undefined;
					args.v.properties = undefined;
					args.v.source = undefined;
					return <span key={'op-' + index} className="trace-op">
						Command result: {JSON.stringify(args.v)}
					</span>;
				}
				default:
					return <span key={'op-' + index} className="trace-op">
						Interop {i.o}
						{i.p && `, param=${i.p}`}
						{i.a && `, args ${JSON.stringify(i.a)}`}
						{i.r && `, result ${JSON.stringify(i.r)}`}
					</span>;
				}
			}
			default:
				return <span key={'op-' + index} className="trace-op">Unknwn operation {op.t}</span>;
			}
		});
	};

	const stepClick = (index: number) => {
		setStepIndex(index);
	};

	let body;

	switch (step.t) {
	case TTraceStepType.Line:
		body = <div>
			{step.v && <div>{listVars(step.v)}</div>}
			{step.o && <div>{listOps(step.o)}</div>}
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
