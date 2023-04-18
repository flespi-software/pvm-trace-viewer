import _ from 'lodash';
import React, { ChangeEvent, useState } from 'react';
import { getSourceCodeLine } from '../../lib/common';
import { getDataSize, TTraceDump, TTraceFile, TTraceStepNewData, TTraceStepType } from '../../types';
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
	const [decodeHex, setDecodeHex] = useState(false);

	const setPacket = (index: number) => {
		setPacketIndex(index);
		setStepIndex(index);
	};

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
	};

	const showAllStepsChanged = (e: ChangeEvent<HTMLInputElement>) => {
		setShowAllSteps(e.target.checked);
	};

	const decodeHexChanged = (e: ChangeEvent<HTMLInputElement>) => {
		setDecodeHex(e.target.checked);
	};

	const prevStep = (index: number) => {
		if (showAllSteps)
			return index - 1;
		else {
			let prev = _.findLastIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, index - 1);
			if (prev === -1)
				prev = _.findLastIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, traceDump.trace.length - 1);
			return prev;
		}
	};

	const nextStep = (index: number) => {
		if (showAllSteps)
			return index + 1;
		else {
			let next = _.findIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, index + 1);
			if (next === -1)
				next = _.findIndex(traceDump.trace, (step) => step.t !== TTraceStepType.Line, 0);
			return next;
		}
	};

	const saveTextFile = (text: string, suffix: string) => {
		const a = document.createElement('a');
		a.download = traceFile.name + suffix;
		a.href = URL.createObjectURL(new Blob([text], {type: 'text/plain'}));
		a.click();
	};

	const jsonRowsToCSV = (rows: Array<Array<any>>) => {
		const lines = [];
		for (const row of rows) {
			const line = [];
			for (const item of row) {
				line.push(JSON.stringify(item));
			}
			lines.push(line.join(';'));
		}
		return lines.join('\n');
	};

	const doExportCSV = () => {
		const csv = [
			['type', 'size', 'hex', 'code'],
		];
		let packet: TTraceStepNewData;
		traceDump.trace.forEach((step) => {
			if (step.t === TTraceStepType.Line)
				return;

			// type
			const row: Array<string> = [step.t];

			// size, hex
			if (step.t === TTraceStepType.NewData) {
				packet = step;
				row.push(getDataSize(step).toString());
				row.push(step.d);
			} else if (step.t === TTraceStepType.Offset) {
				const hex = packet.d.slice(step.l * 2, step.o * 2);
				row.push((step.o - step.l).toString());
				row.push(hex);
			} else if (step.t === TTraceStepType.Error) {
				// size='', hex=<error>
				row.push('');
				row.push(step.m);
			}

			// code
			row.push(getSourceCodeLine(traceDump, step.c[0], step.c[1]));

			csv.push(row);
		});

		// convert to CSV text
		const csvText = jsonRowsToCSV(csv);

		// and save file in the browser
		saveTextFile(csvText, '.export.csv');
	};

	const doExportTXT = () => {
		const lines = [];

		let packet: TTraceStepNewData | null = null;
		let maxSize = 0;
		for (let i = 0; i < traceDump.trace.length; i++) {
			const step = traceDump.trace[i];
			if (step.t === TTraceStepType.NewData) {
				packet = step;
				maxSize = 0;

				if (lines.length > 0)
					lines.push('');
				lines.push(`New packet of ${getDataSize(step)} bytes:`);
				lines.push(`\t${step.d}`);
				lines.push('');

				for (let j = i + 1; j < traceDump.trace.length; j++) {
					const jstep = traceDump.trace[j];
					if (jstep.t === TTraceStepType.Offset) {
						const size = (jstep.o - jstep.l) * 2;
						if (size > maxSize)
							maxSize = size;
					} else if (jstep.t === TTraceStepType.NewData)
						break;
				}
			} else if (step.t === TTraceStepType.Offset) {
				if (packet) {
					const hex = packet.d.slice(step.l * 2, step.o * 2);
					const spaces = maxSize - hex.length;
					lines.push(`${hex}${' '.repeat(spaces)}\t\t${getSourceCodeLine(traceDump, step.c[0], step.c[1])}`);
				}
			} else if (step.t === TTraceStepType.Error) {
				lines.push('');
				lines.push(step.m);
			}
		}

		saveTextFile(lines.join('\n'), '.export.txt');
	};

	return (
		<>
			<div className="trace-file-info">
				Loaded trace dump file <strong>{traceFile.name}</strong> of size <strong>{Number(traceFile.size / 1024).toFixed(2)}</strong> KiB
			</div>
			<TracePacket traceDump={traceDump} packetIndex={packetIndex} setPacketIndex={setPacket} stepIndex={stepIndex} setStepIndex={setStep} decodeHex={decodeHex} />
			<div className="trace-view-settings">
				<button onClick={() => setStep(prevStep(stepIndex))}>&lt;</button>
				<button onClick={() => setStep(nextStep(stepIndex))}>&gt;</button>
				&nbsp;
				<label><input type="checkbox" onChange={showAllStepsChanged} /> show all steps</label>
				&nbsp;|&nbsp;
				<label><input type="checkbox" onChange={decodeHexChanged} /> decode hex</label>
				&nbsp;
				<button onClick={doExportCSV}>Export to CSV</button>
				&nbsp;
				<button onClick={doExportTXT}>Export to TXT</button>
			</div>
			<div className="trace-dump-details">
				<TraceDumpSteps traceDump={traceDump} stepIndex={stepIndex} setStepIndex={setStep} showAllSteps={showAllSteps} decodeHex={decodeHex} />
				<SourceCodeView traceDump={traceDump} stepIndex={stepIndex} />
			</div>
		</>
	);
};

export default TraceDumpViewer;
