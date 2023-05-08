import { serverFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	serverFuncs(ns);
	while (true) {
		await ns.sleep(100);
		if (ns.args.length === 0 || ns.hacknet.numHashes() >= ns.hacknet.hashCapacity()) {
			ns.hacknet.spendHashes("Sell for Money");
			// ns.hacknet.spendHashes("Exchange for Bladeburner Rank");
			// ns.hacknet.spendHashes("Exchange for Bladeburner SP");
		} else {
			const targets = ns.jjy.servers.targets().reverse();
			if (targets.length === 0) continue;
			ns.hacknet.spendHashes("Increase Maximum Money", targets[0]);
			if (ns.getServerMinSecurityLevel(targets[0]) > 1) {
				ns.hacknet.spendHashes("Reduce Minimum Security", targets[0]);
			}
		}
	}
}
