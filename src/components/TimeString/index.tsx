import React from 'react';

interface TimeStringProps {
	/** unix timestamp */
	value: number;
}

const TimeString: React.FC<TimeStringProps> = (props) => {
	const { value } = props;
	const d = new Date(value * 1000);
	const time = d.toLocaleString('en-GB', {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});
	const ms = Number(value).toFixed(6).split('.')[1];
	return <span>{time}.{ms}</span>;
};

export default TimeString;
