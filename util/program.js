/** @param {NS} ns **/
export async function main(ns) {
	while (!ns.fileExists("BruteSSH.exe") ||
		!ns.fileExists("FTPCrack.exe") ||
		!ns.fileExists("relaySMTP.exe") ||
		!ns.fileExists("HTTPWorm.exe") ||
		!ns.fileExists("SQLInject.exe")) {
		if (!ns.isBusy()) {
			ns.createProgram("BruteSSH.exe") ||
				ns.createProgram("FTPCrack.exe") ||
				ns.createProgram("relaySMTP.exe") ||
				ns.createProgram("HTTPWorm.exe") ||
				ns.createProgram("SQLInject.exe");
		}
		await ns.sleep(1000);
	}
}
