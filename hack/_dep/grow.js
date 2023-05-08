/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const delay = ns.args[1];
	let growTime = ns.getGrowTime(target);
	while (true) {
		const weakTime = ns.getWeakenTime(target);
		const offset = weakTime - growTime - delay;
		await ns.sleep(offset);
		growTime = ns.getGrowTime(target);
		await ns.grow(target);
		await ns.sleep(weakTime - growTime - offset);
	}
}
