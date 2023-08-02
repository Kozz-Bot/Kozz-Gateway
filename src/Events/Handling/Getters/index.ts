import boundaries from 'src/Boundaries';
import handlers from 'src/Handlers';

export const getAllBoundaries = () => {
	return Object.keys(boundaries).map(key => {
		const { id, platform, OS } = boundaries[key];

		return {
			name: key,
			boundary: {
				id,
				platform,
				OS,
			},
		};
	});
};

export const getAllHandlers = () => {
	return Object.keys(handlers).map(key => {
		const { id, methods, name, role } = handlers[key];

		return {
			name: key,
			handler: { id, methods, name, role },
		};
	});
};
