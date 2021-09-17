import { TTraceDump } from '../types';

export const scrollTo = (ref: any) => {
	if (ref)
		ref.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
};

const fileIndexToSourceName = (traceDump: TTraceDump, file: number): string | null => {
	const fileId = traceDump.files.find((fId) => fId[0] === file);
	if (!fileId)
		return null;
	const fileName = fileId[1];
	if (fileName === traceDump.bytecode_name)
		return 'main';
	return fileName;
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
