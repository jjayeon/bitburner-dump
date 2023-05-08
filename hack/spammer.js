import { serverFuncs, scriptFuncs, lockFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	serverFuncs(ns);
	scriptFuncs(ns);
	lockFuncs(ns);
	const args = ns.flags([
		["first", 100], ["last", 100], ["c", 1]
	]);
	const hosts = ns.jjy.servers.hosts().filter(host =>
		!ns.jjy.lock.isLocked(host));
	await ns.jjy.scripts.copyAll(hosts, "/hack/_spam/hack.js", "/hack/_spam/grow.js", "/hack/_spam/weaken.js")
	const targets = args._.length > 0 ? args._ :
		ns.jjy.servers.targets()
			.slice(0, args.first)
			.slice(-args.last);
	for (let i = 0; i < args.c; i++) {
		await ns.sleep(1);
		for (let target of targets) {
			const server = ns.getServer(target);
			server.hackDifficulty = server.minDifficulty;
			const oneHack = ns.formulas.hacking.hackPercent(server, ns.getPlayer());
			const growThreads = ns.growthAnalyze(target, 1e18);
			const hackThreads = Math.ceil(1 / oneHack);
			const weakThreads = 2000;
			ns.jjy.scripts.schedule(hosts, "/hack/_spam/hack.js", hackThreads, target, i);
			ns.jjy.scripts.schedule(hosts, "/hack/_spam/grow.js", growThreads, target, i);
			ns.jjy.scripts.schedule(hosts, "/hack/_spam/weaken.js", weakThreads, target, i);
		}
	}
	while (true) {
		let total = 0;
		ns.clearLog();
		for (let target of targets) {
			let income = 0;
			for (let i = 0; i < args.c; i++) {
				income += ns.getScriptIncome("/hack/_spam/hack.js", "home", target, i);
			}
			ns.print(`  income from ${target}: `, ns.nFormat(income, "$0.000a"));
			total += income;
		}
		ns.print(`total income: `, ns.nFormat(total, "$0.000a"));
		await ns.sleep(500);
	}
}
