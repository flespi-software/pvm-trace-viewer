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

export enum TOperationType {
	Interop = 'interop',						// generic interop
	Param = 'param',							// param set
}

export interface TOperationActionBase {
	t: TOperationType;							// operation type
}

export enum TInteropName {
	Login = 'login',							// login
	Send = 'send',								// send response
	RegisterMessage = 'regmsg',					// register message
	WarningLog = 'warning',						// warning log
	SettingSet = 'settset',						// setting set
	SettingsMerge = 'settmrg',					// settings merge
	CommandResult = 'cmdres',					// command result
}

export enum TInteropStatus {
	PVM_ERROR_EXT = -3,
	PVM_UNKNOWN = -2,
	PVM_ERROR_INT = -1,
	PVM_OK = 0,
	PVM_PAUSE = 1,
}

export enum TIOValueType {
	NONE = 'n',									// no IO value inside
	DBUF = 'd',									// binary data value in base64
	JSON = 'j',									// json value
	INT64 = 'i',								// int64_t value
}

export interface TIOValueBase {
	t: TIOValueType;							// IO value type
}

export interface TIOValueNone extends TIOValueBase {
	t: TIOValueType.NONE;
}

export interface TIOValueDbuf extends TIOValueBase {
	t: TIOValueType.DBUF;						// IO value type
	v: string;									// binary data value in base64
}

export interface TIOValueJson extends TIOValueBase {
	t: TIOValueType.JSON;						// IO value type
	v: any;										// json value
}

export interface TIOValueInt64 extends TIOValueBase {
	t: TIOValueType.DBUF;						// IO value type
	v: number;									// int64_t value
}

export interface TOperationActionInterop extends TOperationActionBase {
	t: TOperationType.Interop;					// operation type
	o: TInteropName;							// interop name
	s: TInteropStatus;							// interop result status
	p?: string;									// optional interop string param
	a?: TIOValueBase;							// optional interop args
	r?: TIOValueBase;							// optional interop result
}

export interface TOperationActionParam extends TOperationActionBase {
	t: TOperationType.Param;					// operation type
	n: string;									// param name
	v: any;										// param value
}

export interface TTraceStepLine extends TTraceStepBase {
	t: TTraceStepType.Line;						// step type
	v?: TVariableAction[];						// list of changed variables
	o?: TOperationActionBase[];					// list of operations
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

export interface TSourceCodeFiles {
	[filename: string]: string;
}

export interface TSourceCode {
	mainfile: string;
	files: TSourceCodeFiles;
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
