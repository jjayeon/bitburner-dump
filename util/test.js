/** @param {NS} ns **/
export async function main(ns) {
	let i = 0;
	ns.hacknet.upgradeLevel(i, 1);
	ns.hacknet.upgradeRam(i, 1);
	ns.hacknet.upgradeCore(i, 1);
	ns.hacknet.spendHashes("Sell for Money");
}
