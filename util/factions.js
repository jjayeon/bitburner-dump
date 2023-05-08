/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await ns.sleep(1);
		for (let faction of ns.checkFactionInvitations()) {
			ns.joinFaction(faction);
			// ns.workForFaction(faction, "Hacking Contracts", true);
		}

	}
}
