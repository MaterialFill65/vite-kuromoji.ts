import SurrogateAwareString from "../util/SurrogateAwareString";
import CharacterClass from "./CharacterClass";
import InvokeDefinitionMap from "./InvokeDefinitionMap";

const DEFAULT_CATEGORY = "DEFAULT";

/**
 * CharacterDefinition represents char.def file and
 * defines behavior of unknown word processing
 * @constructor
 */
class CharacterDefinition {
	character_category_map: Uint8Array;
	compatible_category_map: Uint32Array;
	invoke_definition_map?: InvokeDefinitionMap;

	constructor() {
		this.character_category_map = new Uint8Array(65536); // for all UCS2 code points
		this.compatible_category_map = new Uint32Array(65536); // for all UCS2 code points
	}
	/**
	 * Load CharacterDefinition
	 * @param {Uint8Array} cat_map_buffer
	 * @param {Uint32Array} compat_cat_map_buffer
	 * @param {InvokeDefinitionMap} invoke_def_buffer
	 * @returns {CharacterDefinition}
	 */
	static load(
		cat_map_buffer: Uint8Array,
		compat_cat_map_buffer: Uint32Array,
		invoke_def_buffer: Uint8Array,
	): CharacterDefinition {
		const char_def = new CharacterDefinition();
		char_def.character_category_map = cat_map_buffer;
		char_def.compatible_category_map = compat_cat_map_buffer;
		char_def.invoke_definition_map =
			InvokeDefinitionMap.load(invoke_def_buffer);
		return char_def;
	}
	static parseCharCategory(class_id: number, parsed_category_def: string[]) {
		const category = parsed_category_def[1];
		const invoke = Number.parseInt(parsed_category_def[2]);
		const grouping = Number.parseInt(parsed_category_def[3]);
		const max_length = Number.parseInt(parsed_category_def[4]);
		if (!Number.isFinite(invoke) || (invoke !== 0 && invoke !== 1)) {
			console.log(`char.def parse error. INVOKE is 0 or 1 in:${invoke}`);
			return null;
		}
		if (!Number.isFinite(grouping) || (grouping !== 0 && grouping !== 1)) {
			console.log(`char.def parse error. GROUP is 0 or 1 in:${grouping}`);
			return null;
		}
		if (!Number.isFinite(max_length) || max_length < 0) {
			console.log(`char.def parse error. LENGTH is 1 to n:${max_length}`);
			return null;
		}
		const is_invoke = invoke === 1;
		const is_grouping = grouping === 1;

		return new CharacterClass(
			class_id,
			category,
			is_invoke,
			is_grouping,
			max_length,
		);
	}
	static parseCategoryMapping(parsed_category_mapping: RegExpExecArray) {
		const start = Number.parseInt(parsed_category_mapping[1]);
		const default_category = parsed_category_mapping[2];
		const compatible_category =
			3 < parsed_category_mapping.length
				? parsed_category_mapping.slice(3)
				: [];
		if (!Number.isFinite(start) || start < 0 || start > 0xffff) {
			console.log(`char.def parse error. CODE is invalid:${start}`);
		}
		return {
			start: start,
			default: default_category,
			compatible: compatible_category,
		};
	}
	static parseRangeCategoryMapping(parsed_category_mapping: RegExpExecArray) {
		const start = Number.parseInt(parsed_category_mapping[1]);
		const end = Number.parseInt(parsed_category_mapping[2]);
		const default_category = parsed_category_mapping[3];
		const compatible_category =
			4 < parsed_category_mapping.length
				? parsed_category_mapping.slice(4)
				: [];
		if (!Number.isFinite(start) || start < 0 || start > 0xffff) {
			console.log(`char.def parse error. CODE is invalid:${start}`);
		}
		if (!Number.isFinite(end) || end < 0 || end > 0xffff) {
			console.log(`char.def parse error. CODE is invalid:${end}`);
		}
		return {
			start: start,
			end: end,
			default: default_category,
			compatible: compatible_category,
		};
	}
	/**
	 * Initializing method
	 * @param {Array} category_mapping Array of category mapping
	 */
	initCategoryMappings(
		category_mapping: {
			start: number;
			end?: number;
			default: string;
			compatible: string[];
		}[],
	) {
		if (!this.invoke_definition_map) {
			throw new Error("invoke_definition_map is not initialized");
		}
		// Initialize map by DEFAULT class
		let code_point: number;
		if (category_mapping != null) {
			for (let i = 0; i < category_mapping.length; i++) {
				const mapping = category_mapping[i];
				const end = mapping.end || mapping.start;
				for (code_point = mapping.start; code_point <= end; code_point++) {
					// Default Category class ID
					this.character_category_map[code_point] =
						this.invoke_definition_map.lookup(mapping.default);

					for (let j = 0; j < mapping.compatible.length; j++) {
						let bitset = this.compatible_category_map[code_point];
						const compatible_category = mapping.compatible[j];
						if (compatible_category == null) {
							continue;
						}
						const class_id =
							this.invoke_definition_map.lookup(compatible_category); // Default Category
						if (class_id == null) {
							continue;
						}
						const class_id_bit = 1 << class_id;
						bitset = bitset | class_id_bit; // Set a bit of class ID 例えば、class_idが3のとき、3ビット目に1を立てる
						this.compatible_category_map[code_point] = bitset;
					}
				}
			}
		}
		const default_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
		if (default_id == null) {
			return;
		}
		for (
			code_point = 0;
			code_point < this.character_category_map.length;
			code_point++
		) {
			// 他に何のクラスも定義されていなかったときだけ DEFAULT
			if (this.character_category_map[code_point] === 0) {
				// DEFAULT class ID に対応するビットだけ1を立てる
				this.character_category_map[code_point] = 1 << default_id;
			}
		}
	}
	/**
	 * Lookup compatible categories for a character (not included 1st category)
	 * @param {string} ch UCS2 character (just 1st character is effective)
	 * @returns {Array.<CharacterClass>} character classes
	 */
	lookupCompatibleCategory(ch: string): CharacterClass[] {
		if (!this.invoke_definition_map) {
			throw new Error("invoke_definition_map is not initialized");
		}
		const classes: CharacterClass[] = [];

		/*
         if (SurrogateAwareString.isSurrogatePair(ch)) {
         // Surrogate pair character codes can not be defined by char.def
         return classes;
         }*/
		const code = ch.charCodeAt(0);
		let integer: number | undefined = undefined;
		if (code < this.compatible_category_map.length) {
			integer = this.compatible_category_map[code]; // Bitset
		}

		if (integer == null || integer === 0) {
			return classes;
		}

		for (let bit = 0; bit < 32; bit++) {
			// Treat "bit" as a class ID
			if ((integer << (31 - bit)) >>> 31 === 1) {
				const character_class =
					this.invoke_definition_map.getCharacterClass(bit);
				if (character_class == null) {
					continue;
				}
				classes.push(character_class);
			}
		}
		return classes;
	}
	/**
	 * Lookup category for a character
	 * @param {string} ch UCS2 character (just 1st character is effective)
	 * @returns {CharacterClass} character class
	 */
	lookup(ch: string): CharacterClass {
		if (!this.invoke_definition_map) {
			throw new Error("invoke_definition_map is not initialized");
		}
		let class_id: number | undefined;

		const code = ch.charCodeAt(0);
		if (SurrogateAwareString.isSurrogatePair(ch)) {
			// Surrogate pair character codes can not be defined by char.def, so set DEFAULT category
			class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
		} else if (code < this.character_category_map.length) {
			class_id = this.character_category_map[code]; // Read as integer value
		}

		if (class_id == null) {
			class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
		}

		return this.invoke_definition_map.getCharacterClass(class_id);
	}
}

export default CharacterDefinition;
