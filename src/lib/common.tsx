import { TTraceDump } from '../types';

export const scrollTo = (ref: any) => {
	if (ref)
		ref.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
};

const fileIndexToSourceName = (traceDump: TTraceDump, file: number): string | null => {
	const fileId = traceDump.files.find((fId) => fId[0] === file);
	if (!fileId)
		return null;
	return fileId[1];
};

export const getSourceCodeLine = (traceDump: TTraceDump, file: number, lineNum: number) => {
	if (!traceDump.sourceLines)
		return '?';
	const sourceName = fileIndexToSourceName(traceDump, file);
	if (!sourceName)
		return '?';
	const lines = traceDump.sourceLines[sourceName];
	const line = lines[lineNum - 1];
	return line.trim();
};

export const renderDecodedHex = (hex: string) => {
	const bytes: number[] = [];

	let i = 0;
	while (i < hex.length) {
		const hexByte = hex.slice(i, i + 2);
		bytes.push(Number.parseInt(hexByte, 16));
		i += 2;
	}

	const chars = bytes.map((byte, index) => {
		if (byte === 9) {
			return <span key={index} className='special-data-char'>\t</span>;
		} else if (byte === 10) {
			return <span key={index} className='special-data-char'>\n</span>;
		} else if (byte === 13) {
			return <span key={index} className='special-data-char'>\r</span>;
		} else if (byte < 0x20) {
			let char = byte.toString(16).toUpperCase();
			if (char.length < 2)
				char = `0${char}`;
			return <span key={index} className='special-data-char'>\x{char}</span>;
		} else {
			return String.fromCharCode(byte);
		}
	});
	return chars;
};

export const getFileName = (traceDump: TTraceDump, stepIndex: number) => {
	const step = traceDump.trace[stepIndex];
	const fileIndex = step.c[0];
	let fileName;
	for (let f of traceDump.files) {
		if (f[0] === fileIndex) {
			fileName = f[1];
			break;
		}
	}
	return fileName;
};
