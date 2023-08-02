import boundaries from 'src/Boundaries';
import handlers from 'src/Handlers';

export const getAllBoundaries = () => {
	return Object.keys(boundaries).map(key => ({
		name: key,
		boundary: boundaries[key],
	}));
};

export const getAllHandlers = () => {
	return Object.keys(handlers).map(key => ({
		name: key,
		handler: handlers[key],
	}));
};
