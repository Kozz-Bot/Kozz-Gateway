import CodeMirror from '@uiw/react-codemirror';
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
		<S.Shell>
			<CodeMirror
				basicSetup
				extensions={view.extensions}
				height="260px"
				onChange={view.onChange}
				theme={view.codeMirrorTheme}
				value={view.value}
			/>
		</S.Shell>
	);
};
