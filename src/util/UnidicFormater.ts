import type { Formatter, Token } from "./Formatter";

/**
 * Mappings between Unidic dictionary features and tokenized results
 * @constructor
 */
class UnidicFormatter implements Formatter {
	formatEntry(
		word_id: number,
		position: number,
		type: string,
		features: string[],
	) {
		const token: Token = {
			word_id: word_id,
			word_type: type,
			word_position: position,

			surface_form: features[1],
			pos: features[2],
			pos_detail_1: features[3],
			pos_detail_2: features[4],
			pos_detail_3: features[5],
			conjugated_type: features[6],
			conjugated_form: features[7],
			basic_form: features[9],
			reading: features[8],
		};

		return token;
	}
	formatUnknownEntry(
		word_id: number,
		position: number,
		type: string,
		features: string[],
		surface_form: string,
	) {
		const token = {
			word_id: word_id,
			word_type: type,
			word_position: position,

			surface_form: surface_form,
			pos: features[2],
			pos_detail_1: features[3],
			pos_detail_2: features[4],
			pos_detail_3: features[5],
			conjugated_type: features[6],
			conjugated_form: features[7],
			basic_form: features[10],
			// reading: features[11],
		};

		return token;
	}
}

export default UnidicFormatter;
