export type StatItem = {
	label: string;
	value: string | number;
	detail?: string;
};

export const useStatGridBehavior = ({ items }: { items: StatItem[] }) => ({
	items,
});
