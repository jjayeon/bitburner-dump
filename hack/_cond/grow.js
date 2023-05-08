/** @param {NS} ns **/
export async function main(ns) {
	let target = ns.args[0];
	let maxMoney = ns.args[1];
	let minSec = ns.args[2];
	while (ns.getServerMoneyAvailable(target) / maxMoney < 0.95 &&
		ns.getServerSecurityLevel(target) / minSec < 1.25) {
		await ns.grow(target);
	}
}

