import { findIndex, findLastIndex } from 'lodash';
import React from 'react';
import { getDataSize, TTraceDump, TTraceStep, TTraceStepNewData, TTraceStepType } from '../../types';
import TimeString from '../TimeString';
import TracePacketPart from '../TracePacketPart';
import './style.css';

interface TracePacketProps {
	traceDump: TTraceDump;
	packetIndex: number;
	setPacketIndex: (index: number) => void;
	stepIndex: number;
	setStepIndex: (index: number) => void;
	decodeHex: boolean;
}

const prevPacketIndex = (trace: TTraceStep[], fromIndex: number) => findLastIndex(trace, (step) => step.t === TTraceStepType.NewData, fromIndex - 1);

const nextPacketIndex = (trace: TTraceStep[], fromIndex: number) => findIndex(trace, (step) => step.t === TTraceStepType.NewData, fromIndex + 1);

const TracePacket: React.FC<TracePacketProps> = (props) => {
	const { trace } = props.traceDump;
	const { packetIndex, setPacketIndex, stepIndex, setStepIndex, decodeHex } = props;

	const packet = trace[packetIndex] as TTraceStepNewData;

	if (!packet) {
		// searching first available packet
		const first = nextPacketIndex(trace, -1);
		if (first === -1) {
			return <div>No data packets available in the trace file</div>;
		}

		setTimeout(() => setPacketIndex(first));
		return null;
	}

	const goPrevPacket = () => {
		let prev = prevPacketIndex(trace, packetIndex);
		if (prev === -1)
			prev = prevPacketIndex(trace, trace.length);
		setPacketIndex(prev);
	};

	const goNextPacket = () => {
		let next = nextPacketIndex(trace, packetIndex);
		if (next === -1)
			next = nextPacketIndex(trace, -1);
		setPacketIndex(next);
	};

	const packetParts: React.ReactElement[] = [];
	// collect packet parts from the trace steps until the next packet occurs
	let i = packetIndex + 1;
	let step = trace[i];
	while (step && step.t !== TTraceStepType.NewData) {
		if (step.t === TTraceStepType.Offset)
			packetParts.push(<TracePacketPart key={i} packet={packet} step={step} index={i} stepIndex={stepIndex} setStepIndex={setStepIndex} decodeHex={decodeHex} />);
		i += 1;
		step = trace[i];
	}

	return (
		<div className="trace-packet">
			<div className="trace-packet-info">
				<div className="flex">
					<button onClick={goPrevPacket}>&lt;</button>
				</div>
				<div className="flex">
					<button onClick={goNextPacket}>&gt;</button>
				</div>
				<div className="flex trace-packet-pad">
					Time:&nbsp;<TimeString value={packet.tm} />
				</div>
				<div className="flex trace-packet-pad">
					Size: {getDataSize(packet)} B
				</div>
			</div>
			<div className="flex trace-packet-hex">
				{packetParts}
			</div>
		</div>
	);
};

export default TracePacket;
