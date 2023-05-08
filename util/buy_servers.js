import { lockFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
	lockFuncs(ns);
	ns.disableLog("ALL");
	const args = ns.flags([["help", false]]);
	// How much RAM each purchased server will have.
	if (args.help) {
		ns.tprint(`
Automates the purchasing and upgrading of new servers.
Usage: run ${ns.getScriptName()}
Example:
> run ${ns.getScriptName()}`);
		return;
	}
	const maxRam = args._[0] > 0 ? args._[0] :
		ns.getPurchasedServerMaxRam();
	if (Math.log2(maxRam) % 1 !== 0) {
		ns.tprint(`maxRam ${maxRam} not a power of two. aborting.`);
		return;
	}

	await ns.sleep(5000);
	// all server names have the form pserv-[RAM]-num
	while (true) {
		function ramOf(server) {
			return parseInt(server.split("-")[1]);
		}
		const servers = ns.getPurchasedServers();
		const lowestRam = Math.min(...servers.map(server => ramOf(server)));
		const highestRam = Math.max(...servers.map(server => ramOf(server)));
		let lowest = null;
		if (servers.length >= ns.getPurchasedServerLimit()) {
			if (lowestRam >= maxRam) {
				ns.toast("your server farm is maxed out - congrats :)", "success", 5000);
				break;
			}
			lowest = servers.filter(server => ramOf(server) === lowestRam)
				.sort((a, b) => ns.getServerUsedRam(a) - ns.getServerUsedRam(b))[0];
			ns.print(`locking ${lowest}...`);
			ns.jjy.lock.lockServer(lowest, 1000 * 60 * 5, "draining");
			await ns.sleep(1000);
			while (lowest && ns.ps(lowest).length > 0 && ns.jjy.lock.isLocked(lowest)) {
				await ns.sleep(100);
			}
			ns.killall(lowest);
			ns.print(`deleting ${lowest}...`)
			ns.deleteServer(lowest);
			ns.kill("/lock/lock.js", "home", `/lock/_lock/${lowest}.txt`, 1000 * 60 * 5, "draining");
			ns.rm(`/lock/_lock/${lowest}.txt`);
		}
		ns.print(`waiting to buy...`);
		let ram = Math.max(lowestRam * 2, highestRam, maxCanAfford());
		if (servers.length === 0) ram = 4;
		if (ram > maxRam) ram = maxRam;
		ns.print(`want: ${ram} GB for ${ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a")}`);
		await ns.sleep(1000);
		while (!canAfford(ram)) {
			await ns.sleep(100);
		}
		const newServer = ns.purchaseServer(`pserv-${ram}`, ram);
		ns.print(`purchased ${newServer} for ${ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a")}!`);
		ns.toast(`purchased ${newServer} for ${ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a")}!`, "success", 5000);
		await ns.sleep(100);
	}

	function maxCanAfford() {
		const money = ns.getServerMoneyAvailable("home");
		let i = 0;
		while (ns.getPurchasedServerCost(2 ** i) < money) i++;
		return 2 ** (i - 1);
	}
	function canAfford(ram) {
		return ns.getPurchasedServerCost(ram) < ns.getServerMoneyAvailable("home");
	}
	function formatGB(gb, decimals = 0) {
		if (gb === 0) return '0 GB';
		const k = 1000;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = ~~(Math.log(gb) / Math.log(k));
		return parseFloat((gb / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	}
}
