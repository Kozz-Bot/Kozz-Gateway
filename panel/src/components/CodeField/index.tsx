import { useCodeFieldBehavior } from './behavior';
import * as S from './styles';

export const CodeField = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) => {
	const view = useCodeFieldBehavior({ value, onChange });

	return (
		<S.Editor
			basicSetup
			extensions={view.extensions}
			height="260px"
			onChange={view.onChange}
			theme={view.editorTheme}
			value={view.value}
		/>
	);
};
