export type TableColumn<T> = {
	key: string;
	label: string;
	render: (row: T) => string | number;
};

export const useDataTableBehavior = <T,>({
	columns,
	rows,
}: {
	columns: TableColumn<T>[];
	rows: T[];
}) => ({
	columns,
	rows,
});
