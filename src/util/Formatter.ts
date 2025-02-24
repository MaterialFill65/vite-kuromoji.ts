export interface Formatter {
	formatEntry(
		word_id: number,
		position: number,
		type: string,
		features: string[],
	): Token;
	formatUnknownEntry(
		word_id: number,
		position: number,
		type: string,
		features: string[],
		surface_form: string,
	): Token;
}

export interface Token {
	word_id?: number;
	word_type: string;
	word_position: number;
	surface_form: string;
	pos: string;
	pos_detail_1: string;
	pos_detail_2: string;
	pos_detail_3: string;
	conjugated_type: string;
	conjugated_form: string;
	basic_form: string;
	reading?: string;
	pronunciation?: string;
};
