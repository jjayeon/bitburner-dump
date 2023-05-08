import { serverFuncs, scriptFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	serverFuncs(ns);
	scriptFuncs(ns);
	const script = "/util/_share/share.js";
	while (true) {
		const hosts = ns.jjy.servers.hosts();
		const maxRam = ns.getServerMaxRam(hosts[0]);
		await ns.jjy.scripts.copyAll(hosts, script);
		for (let host of hosts) {
			let threads = ns.jjy.scripts.maxThreads(host, script);
			if (host === "home" || ns.getServerMaxRam(host) > maxRam / 8) {
				threads /= 2;
			}
			if (threads > 0) {
				ns.exec(script, host, threads);
			}
		}
		await ns.sleep(1000);
		ns.print("share power: ", ns.getSharePower());
		await ns.sleep(2000);
	}
}
