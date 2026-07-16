import { TableColumn, useDataTableBehavior } from './behavior';
import * as S from './styles';

export const DataTable = <T,>({
	columns,
	rows,
}: {
	columns: TableColumn<T>[];
	rows: T[];
}) => {
	const view = useDataTableBehavior({ columns, rows });

	return (
		<S.Wrap>
			<S.Table>
				<thead>
					<tr>
						{view.columns.map(column => (
							<S.HeadCell key={column.key}>{column.label}</S.HeadCell>
						))}
					</tr>
				</thead>
				<tbody>
					{view.rows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{view.columns.map(column => (
								<S.Cell key={column.key}>{column.render(row)}</S.Cell>
							))}
						</tr>
					))}
				</tbody>
			</S.Table>
		</S.Wrap>
	);
};
