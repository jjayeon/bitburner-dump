import { serverFuncs } from "/jjy";

/** @param {NS} ns */
export async function main(ns) {
	serverFuncs(ns);
	const hasSingularity = ns.getOwnedSourceFiles().find(sourceFileLvl => sourceFileLvl.n === 4);
	if (!hasSingularity) return;
	const allServers = ns.jjy.servers.all();
	const backdoorThese = [
		"CSEC",
		"avmnite-02h",
		"I.I.I.I",
		"run4theh111z",
		// "powerhouse-fitness",
		// "fulcrumassets",
	];
	if (ns.singularity.getOwnedAugmentations().includes("The Red Pill")) {
		backdoorThese.push("w0r1d_d43m0n");
	}
	while (backdoorThese.length > 0) {
		await ns.sleep(100);
		if (ns.getServerRequiredHackingLevel(backdoorThese[0]) >
			ns.getHackingLevel() ||
			!ns.hasRootAccess(backdoorThese[0])) {
			continue;
		}
		for (let host of allServers[backdoorThese[0]]) {
			ns.connect(host);
		}
		await ns.installBackdoor();
		ns.toast("Backdoor installed on " + backdoorThese[0]);
		backdoorThese.shift();
		ns.connect("home");
	}
}
