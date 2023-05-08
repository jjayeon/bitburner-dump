import { serverFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	serverFuncs(ns);
	const targets = ns.jjy.servers.targets();
	let total = 0;
	ns.tprint("~~~~~~~~ MARKET CAP BY SERVER ~~~~~~~~");
	for (let target of targets) {
		total += ns.getServerMaxMoney(target);
		ns.tprint(`${target}: `, ns.nFormat(total, "$0.000a").padStart(9, " "));
	}
}
