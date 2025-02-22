import ByteBuffer from "../util/ByteBuffer";
import CharacterDefinition from "./CharacterDefinition";
import type InvokeDefinitionMap from "./InvokeDefinitionMap";
import TokenInfoDictionary from "./TokenInfoDictionary";

/**
 * UnknownDictionary
 * @constructor
 */
// Inherit from TokenInfoDictionary as a super class
class UnknownDictionary extends TokenInfoDictionary {
	character_definition?: CharacterDefinition;
	constructor() {
		super();
		this.dictionary = new ByteBuffer(10 * 1024 * 1024);
		this.target_map = {}; // class_id (of CharacterClass) -> token_info_id (of unknown class)
		this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
	}
	characterDefinition(character_definition: CharacterDefinition) {
		this.character_definition = character_definition;
		return this;
	}
	lookup(ch: string) {
		if (!this.character_definition) {
			throw new Error("Character definition is not initialized");
		}
		return this.character_definition.lookup(ch);
	}
	lookupCompatibleCategory(ch: string) {
		if (!this.character_definition) {
			throw new Error("Character definition is not initialized");
		}
		return this.character_definition.lookupCompatibleCategory(ch);
	}
	loadUnknownDictionaries(
		unk_buffer: Uint8Array<ArrayBufferLike>,
		unk_pos_buffer: Uint8Array<ArrayBufferLike>,
		unk_map_buffer: Uint8Array<ArrayBufferLike>,
		cat_map_buffer: Uint8Array,
		compat_cat_map_buffer: Uint32Array,
		invoke_def_buffer: Uint8Array,
	) {
		this.loadDictionary(unk_buffer);
		this.loadPosVector(unk_pos_buffer);
		this.loadTargetMap(unk_map_buffer);
		this.character_definition = CharacterDefinition.load(
			cat_map_buffer,
			compat_cat_map_buffer,
			invoke_def_buffer,
		);
	}
}

export default UnknownDictionary;
