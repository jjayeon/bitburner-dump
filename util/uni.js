/** @param {NS} ns */
export async function main(ns) {
	const lesson = ns.args[0] || "Algorithms";
	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		const info = ns.sleeve.getSleeveStats(i);
		if (info.shock > 97) {
			ns.sleeve.setToShockRecovery(i);
		} else {
			ns.sleeve.setToUniversityCourse(i, "Rothman University", lesson);
		}
	}
}
