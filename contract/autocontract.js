/** @param {NS} ns **/
export async function main(ns) {
	// ns.tprint(ns.heart.break());
	function repNeededForFavor(targetFavor, startFavor = 0) {
		const ReputationToFavorBase = 500;
		const ReputationToFavorMult = 1.02;

		let rep = 0;
		let currFavor = 0;

		let reqdRep = ReputationToFavorBase;
		while (currFavor < targetFavor) {
			if (currFavor === startFavor) rep = 0;
			rep += reqdRep;
			reqdRep *= ReputationToFavorMult;
			currFavor++;
		}
		return rep;
	}
	let startFavor = 0;
	let targetFavor = 150;
	if (ns.args.length === 1) targetFavor = ns.args[0];
	if (ns.args.length === 2) {
		startFavor = ns.args[0];
		targetFavor = ns.args[1];
	}
	let repNeeded = repNeededForFavor(targetFavor, startFavor);
	ns.tprint(`Going from ${startFavor} to ${targetFavor} favor requires ${ns.nFormat(repNeeded, "0.000a")} rep.`);
}

