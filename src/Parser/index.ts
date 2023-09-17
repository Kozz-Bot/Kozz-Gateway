import {
	anyCharExcept,
	sequenceOf,
	many,
	many1,
	char,
	choice,
	str,
	possibly,
	anythingExcept,
	Parser,
	regex,
} from 'arcsecond';

//Utilities
const space = char(' ');
const number = regex(/^[0-9]+/);
const anythingBut = (s: string) => many1(anyCharExcept(str(s))).map(r => r.join(''));
const anythingButSpace = anythingBut(' ');
const anythingButParser = <T, D extends string, E>(p: Parser<T, D, E>) =>
	many1(anyCharExcept(p)).map(r => r.join(''));

//Pieces of command
const commandChar = choice([char('!'), char('/')]);
const modName = sequenceOf([many(space), anythingButSpace]).map(r => r[1]);
const contactTag = sequenceOf([str('@'), number]).map(x => {
	return x[1];
});

const method = possibly(
	sequenceOf([
		many(space),
		anythingButParser(choice([str('--'), space, contactTag])),
	]).map(r => r[1])
).map(x => x || 'default');

const immediateArg = choice([
	contactTag,
	sequenceOf([many(space), anythingButParser(choice([str('--')]))]),
]).map(r => {
	return r[1];
});

const toArg = (x: string) =>
	x === 'true' ? true : x === 'false' ? false : !isNaN(Number(x)) ? Number(x) : x;

/**
 * I thought it would be better to use this as an IIFE
 * closing `argName` and `argValue` inside the scope of
 * the namedArgs definition
 */
const namedArgs = (() => {
	const argName = sequenceOf([many(space), str('--'), anythingButSpace]).map(r => {
		return r[2];
	});

	const argValue = possibly(
		choice([sequenceOf([many1(space), anythingButParser(str('--'))]), contactTag])
	).map(x => {
		return toArg(x ? x[1].trim() : 'true');
	});

	return many1(
		sequenceOf([argName, argValue]).map(r => ({
			[r[0]]: r[1],
		}))
	).map(x =>
		x.reduce((args, currArg) => {
			return {
				...args,
				...currArg,
			};
		})
	);
})();

const parser = sequenceOf([
	commandChar,
	modName,
	method,
	possibly(immediateArg),
	possibly(namedArgs),
]).map(r => ({
	module: r[1],
	method: r[2],
	immediateArg: r[3]?.trim() || null,
	namedArgs: r[4],
	// Ugly AF, but it works so dont touch it :v
	query: r[2] !== 'default' ? `${r[2]} ${r[3] || ''}`.trim() : (r[3] ?? '').trim(),
}));

/**
 * Utility parsing function that adds more data for the user
 * to debug where the parsing failed
 * @param s
 * @returns
 */
export const parse = (s: string) => {
	const result = parser.run(s);

	const stringLeft = result.isError
		? s.slice(result.index - 1, result.index + 20) + '...'
		: '';

	return {
		...result,
		stringLeft,
	};
};
