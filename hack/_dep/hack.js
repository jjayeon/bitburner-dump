/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const delay = ns.args[1];
	let hackTime = ns.getHackTime(target);
	while (true) {
		const weakTime = ns.getWeakenTime(target);
		const offset = weakTime - hackTime - delay * 2;
		await ns.sleep(offset);
		hackTime = ns.getHackTime(target);
		if (ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) < 1.01) {
			await ns.hack(target);
		}
		await ns.sleep(weakTime - hackTime - offset);
	}
}
