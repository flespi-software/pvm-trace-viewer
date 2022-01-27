import React from 'react';
import { TTraceStepNewData, TTraceStepOffset } from '../../types';
import { renderDecodedHex, scrollTo } from '../../lib/common';
import './style.css';

interface TracePacketPartProps {
	packet: TTraceStepNewData;
	step: TTraceStepOffset;
	index: number;
	stepIndex: number;
	setStepIndex: (index: number) => void;
	decodeHex: boolean;
}

const TracePacketPart: React.FC<TracePacketPartProps> = (props) => {
	const { packet, step, index, stepIndex, setStepIndex, decodeHex } = props;

	const showStep = (index: number) => {
		setStepIndex(index);
	};
	const hex = packet.d.slice(step.l * 2, step.o * 2);

	return (
		<span
			ref={index === stepIndex ? scrollTo : undefined}
			className={index === stepIndex ? 'trace-packet-part trace-packet-part-selected' : 'trace-packet-part'}
			onClick={() => showStep(index)}>
			{decodeHex ? renderDecodedHex(hex) : hex}
		</span>
	);
};

export default TracePacketPart;
