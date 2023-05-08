import { serverFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	serverFuncs(ns);
	const hasSingularity = ns.getOwnedSourceFiles().find(sourceFileLvl => sourceFileLvl.n === 4);
	const allServers = ns.jjy.servers.all();
	while (true) {
		await ns.sleep(1000);
		const servers = Object.keys(allServers).filter(server =>
			ns.serverExists(server) &&
			!ns.hasRootAccess(server));
		if (servers.length === 0) return;

		if (hasSingularity) {
			ns.purchaseTor();
			ns.purchaseProgram("BruteSSH.exe");
			ns.purchaseProgram("FTPCrack.exe");
			ns.purchaseProgram("relaySMTP.exe");
			ns.purchaseProgram("HTTPWorm.exe");
			ns.purchaseProgram("SQLInject.exe");
		}

		for (let server of servers) {
			let ports = 0;
			if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server); ports++; }
			if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server); ports++; }
			if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(server); ports++; }
			if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(server); ports++; }
			if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(server); ports++; }
			if (ports >= ns.getServerNumPortsRequired(server)) {
				ns.nuke(server);
				// ns.toast(`cracked ${server}!`);
			}
		}
	}
}
