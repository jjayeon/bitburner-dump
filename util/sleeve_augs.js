/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await ns.sleep(100);
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			await ns.sleep(1);
			ns.sleeve.getSleevePurchasableAugs(i)
				.forEach(aug => {
					for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
						ns.sleeve.purchaseSleeveAug(i, aug.name)
					}
				});
		}
	}
}
