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
}
