/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["s", false]]);
	const stats = ["strength", "defense", "dexterity", "agility"];
	if (args.s) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			const info = ns.sleeve.getSleeveStats(i);
			ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", stats[i % stats.length]);
		}
	} else {
		while (true) {
			for (let stat of stats) {
				ns.gymWorkout("Powerhouse Gym", stat, false);
				await ns.sleep(10000);
			}
		}
	}
}
