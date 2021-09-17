import React from 'react';
import { TTraceStepNewData, TTraceStepOffset } from '../../types';
import { scrollTo } from '../../lib/common';
import './style.css';

interface TracePacketPartProps {
	packet: TTraceStepNewData;
	step: TTraceStepOffset;
	index: number;
	stepIndex: number;
	setStepIndex: (index: number) => void;
}

const TracePacketPart: React.FC<TracePacketPartProps> = (props) => {
	const { packet, step, index, stepIndex, setStepIndex } = props;

	const showStep = (index: number) => {
		setStepIndex(index);
	}

	return <span
			ref={index === stepIndex ? scrollTo : undefined}
			className={index === stepIndex ? 'trace-packet-part trace-packet-part-selected' : 'trace-packet-part'}
			onClick={() => showStep(index)}>
		{packet.d.slice(step.l * 2, step.o * 2)}
	</span>;
};

export default TracePacketPart;
