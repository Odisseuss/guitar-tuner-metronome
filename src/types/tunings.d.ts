export interface Frequencies {
	string_1: number;
	string_2: number;
	string_3: number;
	string_4: number;
	string_5: number;
	string_6: number;
}
export interface Letters {
	string_1: string;
	string_2: string;
	string_3: string;
	string_4: string;
	string_5: string;
	string_6: string;
}
export interface Tuning {
	frequencies: Frequencies;
	letters: Letters;
}
let Standard: Tuning = {
	frequencies: {
		string_1: 82,
		string_2: 110,
		string_3: 146,
		string_4: 196,
		string_5: 246,
		string_6: 329,
	},
	letters: {
		string_1: 'E',
		string_2: 'A',
		string_3: 'D',
		string_4: 'G',
		string_5: 'B',
		string_6: 'E',
	},
};
let DropD: Tuning = {
	frequencies: {
		string_1: 73,
		string_2: 110,
		string_3: 146,
		string_4: 196,
		string_5: 246,
		string_6: 329,
	},
	letters: {
		string_1: 'D',
		string_2: 'A',
		string_3: 'D',
		string_4: 'G',
		string_5: 'B',
		string_6: 'E',
	},
};
let DoubleDropD: Tuning = {
	frequencies: {
		string_1: 73,
		string_2: 110,
		string_3: 146,
		string_4: 196,
		string_5: 246,
		string_6: 293,
	},
	letters: {
		string_1: 'D',
		string_2: 'A',
		string_3: 'D',
		string_4: 'G',
		string_5: 'B',
		string_6: 'D',
	},
};
let DADGAD: Tuning = {
	frequencies: {
		string_1: 73,
		string_2: 110,
		string_3: 146,
		string_4: 196,
		string_5: 220,
		string_6: 293,
	},
	letters: {
		string_1: 'D',
		string_2: 'A',
		string_3: 'D',
		string_4: 'G',
		string_5: 'A',
		string_6: 'D',
	},
};
let OpenD: Tuning = {
	frequencies: {
		string_1: 73,
		string_2: 110,
		string_3: 146,
		string_4: 185,
		string_5: 220,
		string_6: 293,
	},
	letters: {
		string_1: 'D',
		string_2: 'A',
		string_3: 'D',
		string_4: 'F#',
		string_5: 'A',
		string_6: 'D',
	},
};
let OpenE: Tuning = {
	frequencies: {
		string_1: 82,
		string_2: 123,
		string_3: 164,
		string_4: 207,
		string_5: 246,
		string_6: 329,
	},
	letters: {
		string_1: 'E',
		string_2: 'B',
		string_3: 'E',
		string_4: 'G#',
		string_5: 'B',
		string_6: 'E',
	},
};
let OpenG: Tuning = {
	frequencies: {
		string_1: 73,
		string_2: 98,
		string_3: 146,
		string_4: 185,
		string_5: 246,
		string_6: 293,
	},
	letters: {
		string_1: 'D',
		string_2: 'G',
		string_3: 'D',
		string_4: 'G',
		string_5: 'B',
		string_6: 'D',
	},
};
let Tunings = {
	Standard: Standard,
	'Drop D': DropD,
	'Double Drop D': DoubleDropD,
	DADGAD: DADGAD,
	'Open D': OpenD,
	'Open E': OpenE,
	'Open G': OpenG,
};

export default Tunings;
