/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await ns.sleep(100);
		for (let fragment of ns.stanek.activeFragments()) {
			await ns.stanek.chargeFragment(fragment.x, fragment.y); // booster fragment issue
		}
	}
}
