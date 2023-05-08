import { serverFuncs, lockFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	serverFuncs(ns);
	lockFuncs(ns);
	const hosts = ns.jjy.servers.hosts();
	for (let host of hosts) {
		if (host !== "home") ns.killall(host);
	}
	ns.jjy.lock.clearLocks();
	const homeRam = ns.getServerMaxRam("home");
	if (homeRam >= 64) ns.run("/util/crack_all.js", 1);
	if (homeRam >= 64) ns.run("/util/buy_servers.js", 1);
	if (homeRam >= 128) ns.run("/util/backdoor.js", 1);
	if (homeRam >= 128) ns.run("/util/gang.js", 1);
	ns.run("/util/info.js", 1, "-u")
	// if (homeRam >= 128) ns.run("/util/hacknet_spend.js", 1);
	// if (homeRam >= 128) ns.run("/contract/autocontract.js");

	ns.spawn("/hack/director.js", 1);
}
