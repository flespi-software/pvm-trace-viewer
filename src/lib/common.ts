export const scrollTo = (ref: any) => {
	if (ref)
		ref.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
};
