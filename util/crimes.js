/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["s", false]]);
	const crime = args._[0] || "Homicide";
	if (args.s) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			ns.sleeve.setToCommitCrime(i, crime);
		}
	} else {
		while (true) {
			// if (ns.checkFactionInvitations().length > 0) return;
			if (!ns.isBusy()) ns.commitCrime(crime);
			ns.print(ns.heart.break());
			await ns.sleep(1000);
		}
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
