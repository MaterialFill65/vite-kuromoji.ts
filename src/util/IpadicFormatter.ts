import type { Formatter, Token } from "./Formatter";

/**
 * Mappings between IPADIC dictionary features and tokenized results
 * @constructor
 */
class IpadicFormatter implements Formatter {
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

			surface_form: features[0],
			pos: features[1],
			pos_detail_1: features[2],
			pos_detail_2: features[3],
			pos_detail_3: features[4],
			conjugated_type: features[5],
			conjugated_form: features[6],
			basic_form: features[7],
			reading: features[8],
			pronunciation: features[9],
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
			pos: features[1],
			pos_detail_1: features[2],
			pos_detail_2: features[3],
			pos_detail_3: features[4],
			conjugated_type: features[5],
			conjugated_form: features[6],
			basic_form: features[7],
			// reading:features[8],
			// pronunciation:features[9],
		};

		return token;
	}
}

export default IpadicFormatter;
