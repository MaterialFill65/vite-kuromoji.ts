import ConnectionCosts from "../ConnectionCosts";

/**
 * Builder class for constructing ConnectionCosts object
 * @constructor
 */
class ConnectionCostsBuilder {
	lines: number;
	connection_cost?: ConnectionCosts;
	constructor() {
		this.lines = 0;
	}
	putLine(line: string) {
		if (this.lines === 0) {
			const dimensions = line.split(" ");
			const forward_dimension = Number.parseInt(dimensions[0]);
			const backward_dimension = Number.parseInt(dimensions[1]);

			if (forward_dimension < 0 || backward_dimension < 0) {
				throw "Parse error of matrix.def";
			}

			this.connection_cost = new ConnectionCosts(
				forward_dimension,
				backward_dimension,
			);
			this.lines++;
			return this;
		}

		const costs = line.split(" ");

		if (costs.length !== 3) {
			return this;
		}

		const forward_id = Number.parseInt(costs[0]);
		const backward_id = Number.parseInt(costs[1]);
		const cost = Number.parseInt(costs[2]);

		if (
			forward_id < 0 ||
			backward_id < 0 ||
			!Number.isFinite(forward_id) ||
			!Number.isFinite(backward_id) ||
			this.connection_cost?.forward_dimension! <= forward_id ||
			this.connection_cost?.backward_dimension! <= backward_id
		) {
			throw "Parse error of matrix.def";
		}

		this.connection_cost?.put(forward_id, backward_id, cost);
		this.lines++;
		return this;
	}
	build(): ConnectionCosts {
		if (!this.connection_cost) {
			throw new Error("ConnectionCosts is not initialized");
		}
		return this.connection_cost;
	}
}

export default ConnectionCostsBuilder;
