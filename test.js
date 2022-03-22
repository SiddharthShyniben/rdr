import refactor from './index.js';
import {highlight} from 'cli-highlight';

const testCases = [
	`const thing = true ? a : b;`,

	`if (true) thing();`,
	`if (true) {thing()};`,

	`
if (true) thing();
else another();
	`,
	`
if (true) {
	thing();
	anotherThing();
	if (false) more();
}
else {another()};
	`,

	`const thing = false ? a : b;`,

	`if (false) thing();`,
	`if (false) {thing()};`,

	`
if (false) thing();
else another();
	`,
	`
if (false) {
	thing();
	moreThing();
	if (true) anotherThing();
} else {another()};
	`,

	`if (false) thing();`,
	`if (false) {thing()};`,

	`const thing = foo ? true : false;`,

	`
if (foo) return true;
else return false;
	`,

	`const thing = foo ? true : true;`,

	`
if (foo) return true;
else return true;
	`,

	`const thing = foo ? false : false;`,

	`
if (foo) return false;
else return false;
	`,

	`const thing = foo ? false : true;`,

	`
if (foo) return false;
else return true;
	`,

	`const thing = a ? a : b;`,

	`
if (a) return a;
else return b;
	`,

	`const thing = a ? b : a;`,

	`
if (a) return b;
else return a;
	`,

	`
if (sth) {
	return a;
} else {
	doB();
	doC();
}
	`,

	`
if (a) return somefn();
else return sthElse();
	`,

	`
if (someTh && otherTh) a = b;
else a = c;
	`,

	`
let a;
a = 1;
	`,

	`
let b;
if (sth) b = 2;
	`,

	`
let c;
if (true) c = 3;
	`,

	`if (a) if (b) if (c) d();`,

	`
if (a) {
	if (b) {
		if (c) {
			d();
		}
	}
}
	`,

	`
if (a) {

} else {
	if (b) {

	} else {
		if (c) {
			d();
		} else {}
	}
}
	`,
	// `const hugeStr = a + ' ' + b + ' thing is a ' + c + 'lolol';`,
].map(a => a.trim());

testCases.forEach(testCase => {
	const result = refactor(testCase);
	console.log('\n\n');
	console.log(highlight(testCase, {language: 'javascript'}));
	console.log('\u001b[30;1m' + '-'.repeat(Math.max(...testCase.split('\n').map(a => a.length), ...result.split('\n').map(a => a.length))), '\u001b[0m');
	console.log(highlight(result, {language: 'javascript'}));
});
