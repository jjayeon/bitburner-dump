/** @param {NS} ns **/
export async function main(ns) {
	const crime = ns.args[0] || "Homicide";
	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		ns.sleeve.setToCommitCrime(i, crime);
	}
	while (ns.heart.break() > -54000) {
		// if (ns.checkFactionInvitations().length > 0) return;
		if (!ns.isBusy()) ns.commitCrime(crime);
		ns.print(ns.heart.break());
		await ns.sleep(3000);
	}
}

const crimes = [
	"Shoplift",
	"Rob Store",
	"Mug Someone",
	"Larceny",
	"Deal Drugs",
	"Traffick Illegal Arms",
	"Homicide",
	"Grand Theft Auto",
	"Kidnap",
	"Assassination",
	"Heist"
]
