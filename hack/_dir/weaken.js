/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const offset = ns.args[1];
	await ns.sleep(offset);
	await ns.weaken(target);
}
