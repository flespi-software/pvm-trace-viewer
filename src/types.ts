export interface TTraceFile {
	name: string;								// trace dump file name
	size: number;								// trace dump file size
}

export enum TTraceStepType {
	Line = 'l',									// new line of source code
	NewData = 'n',								// new input data received
	Offset = 'o',								// parsed part of the input data
	Error = 'e',								// error occured
}

export type TCodeLocation =
	[number, number, number];					// file, line, column

export type TVariableUnset = number;

export type TVariableSet =
	[number, number, string];					// variable id, variable type, variable value

export type TVariableAction = TVariableUnset | TVariableSet;

export interface TTraceStepBase {
	c: TCodeLocation;							// source code location
}

export interface TTraceStepLine extends TTraceStepBase {
	t: TTraceStepType.Line;						// step type
	v: TVariableAction[];						// list of changed variables
}

export interface TTraceStepNewData extends TTraceStepBase {
	t: TTraceStepType.NewData;					// step type
	tm: number;									// timestamp
	d: string;									// hex string of the incoming data
	o: number;									// offset, 0 usually

	// getSize(): number;
}

// export class CTraceStepNewData implements TTraceStepNewData {
// 	getSize = () => {
// 		return 0;
// 	}
// }

export const getDataSize = (step: TTraceStepNewData) => step.d.length / 2;

export interface TTraceStepOffset extends TTraceStepBase {
	t: TTraceStepType.Offset;					// step type
	o: number;									// offset
	l: number;									// last (previous) offset
}

export interface TTraceStepError extends TTraceStepBase {
	t: TTraceStepType.Error;						// step type
	o: number;									// offset
	m: string;									// error message
}

export type TTraceStep = TTraceStepLine | TTraceStepNewData | TTraceStepOffset | TTraceStepError;

export type TCodeFileId = [number, string];		// file id, file name

export type TVariableId = [number, string];		// variable id, variable name

export interface TSourceCode {
	main: string;
	[key: string]: string;
}

export interface TSourceCodeLines {
	[key: string]: string[];
}

export interface TTraceDump {
	bytecode_name: string;
	files: TCodeFileId[];
	variables: TVariableId[];
	trace: TTraceStep[];
	source?: TSourceCode;
	sourceLines?: TSourceCodeLines;
}
