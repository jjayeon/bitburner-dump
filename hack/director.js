import { serverFuncs, scriptFuncs, lockFuncs } from "/jjy";

export function autocomplete(data, args) {
	return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	serverFuncs(ns);
	scriptFuncs(ns);
	lockFuncs(ns);
	// batches per second. Increase = increase income, and
	// increase chance of double-hacks and zeroing out a server.
	const batchesPerSecond = 4;
	const batchTime = 1000 / batchesPerSecond;

	// delay between scripts in one batch.  Shouldn't need to change.
	const delay = 20;

	// Excess weaken threads. Increase = increase RAM use, and
	// decrease chance of runaway security level.
	const weakFactor = 5;

	// Excess grow threads. Increase = exponentially increase RAM use, and
	// decrease impact of double-hacks.  Further explanation below.
	const growExponent = 2;

	// Percent hacked per batch.  Increase = increase income, and
	// increase impact of double-hacks.
	let hackPerc = .1;
	// We can expect to hack 10% of a server's money per second.
	while (true) {
		const hosts = ns.jjy.servers.hosts();
		await ns.jjy.scripts.copyAll(hosts,
			"/hack/_dir/weaken.js", "/hack/_dir/grow.js", "/hack/_dir/hack.js");
		const targets = ns.args.length > 0 ? ns.args : calculateTargets(hosts);
		const freeTargets = targets.filter(target => !ns.jjy.lock.isLocked(target));
		ns.print(freeTargets);

		let total = 0;
		for (let target of freeTargets) {
			await ns.sleep(1);
			const freeHosts = hosts.filter(host =>
				!ns.jjy.lock.isLocked(host))
			const currSec = ns.getServerSecurityLevel(target);
			const minSec = ns.getServerMinSecurityLevel(target);
			let result;
			if (currSec - minSec > 25 || currSec >= 100) {
				result = reset(freeHosts, target);
				ns.jjy.lock.lockServer(target, ns.getWeakenTime(target) + 1000, "reset");
			} else {
				result = hwgw(freeHosts, target);
				ns.jjy.lock.lockServer(target, batchTime, "HWGW");
			}
			if (result > 0) {
				ns.print(`${result} threads failed against ${target}`);
			}
			total += result;
		}
		if ((freeTargets.length === 0 || total > 0) && hackPerc > .1) {
			hackPerc -= 0.01;
		}
		else if (freeTargets.length > 0 && hackPerc < .2) {
			hackPerc += 0.01;
		}
		ns.print(hackPerc);
		await ns.sleep(batchTime + delay);
	}

	function calculateTargets(hosts) {
		function batchCost(target) {
			const threads = hwgwThreads(target);
			const totalThreads = threads.hackThreads +
				threads.hackWeakThreads +
				threads.growThreads +
				threads.growWeakThreads;
			const batchCost = Math.ceil(totalThreads * 1.75); // about 1.75 GB ram per instance
			return batchCost;
		}
		function cycleCost(target) {
			const cost = batchCost(target);
			const batches = ns.getWeakenTime(target) / batchTime;
			const cycleCost = cost * ~~batches;
			return cycleCost;
		}
		const totalRam = hosts.filter(host => !host.includes("hacknet"))
			.map(host => ns.getServerMaxRam(host))
			.reduce((a, b) => a + b);
		function income(target) {
			const cost = cycleCost(target);
			let income = ns.getServerMaxMoney(target) * hackPerc * batchesPerSecond;
			if (cost > totalRam) {
				income *= totalRam / cost;
			}
			return income;
		}

		let ram = totalRam - hosts.map(ns.getServerUsedRam)
			.reduce((a, b) => a + b,
				Math.min(ns.getServerMaxRam("home"), 64));

		const targets = ns.jjy.servers.targets();
		targets.sort((a, b) => income(b) - income(a));
		const newTargets = [];
		for (let target of targets) {
			if (newTargets.length >= 5 ||
				batchCost(target) > ram) continue;
			newTargets.push(target);
			ram -= batchCost(target);
		}
		return newTargets;
	}

	// reset server to min security and max money
	function reset(hosts, target) {
		const currSec = ns.getServerSecurityLevel(target);
		const minSec = ns.getServerMinSecurityLevel(target);
		const currMoney = ns.getServerMoneyAvailable(target);
		const maxMoney = ns.getServerMaxMoney(target);

		const growAmt = maxMoney / currMoney;
		const growThreads = ns.growthAnalyze(target, growAmt === Infinity ? 1e12 : growAmt);
		const weakThreads = (currSec - minSec + ns.growthAnalyzeSecurity(growThreads)) / ns.weakenAnalyze(1);
		let result = 0;
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/weaken.js", weakThreads,
			target, 0, Math.random());
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/grow.js", growThreads,
			target, 0, Math.random());
		return result;
	}

	function hwgw(hosts, target) {
		const threads = hwgwThreads(target);

		const hackOffset = ns.getWeakenTime(target) - ns.getHackTime(target) - delay;
		const hackWeakOffset = 0;
		const growOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) + delay;
		const growWeakOffset = delay * 2;

		let result = 0;
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/grow.js", threads.growThreads,
			target, growOffset, Math.random());
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/hack.js", threads.hackThreads,
			target, hackOffset, Math.random());
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/weaken.js", threads.hackWeakThreads,
			target, hackWeakOffset, Math.random());
		result += ns.jjy.scripts.schedule(hosts, "/hack/_dir/weaken.js", threads.growWeakThreads,
			target, growWeakOffset, Math.random());
		return result;
	}

	function hwgwThreads(target) {
		let oneHack = ns.hackAnalyze(target);

		if (ns.fileExists("Formulas.exe", "home")) {
			const server = ns.getServer(target);
			server.hackDifficulty = server.minDifficulty;
			oneHack = ns.formulas.hacking.hackPercent(server, ns.getPlayer());
		}

		const hackThreads = Math.ceil(hackPerc / oneHack);
		const hackWeakThreads = weakFactor * ns.hackAnalyzeSecurity(hackThreads) / ns.weakenAnalyze(1);
		// We recalculate hackAmt to deal with rounding errors in hackThreads.
		// This becomes especially relevant when hackThreads < 1.
		const hackAmt = hackThreads * oneHack;
		let growAmt = (1 / (1 - hackAmt)) ** growExponent;
		if (isNaN(growAmt)) growAmt = 2;
		const growThreads = ns.growthAnalyze(target, growAmt);
		const growWeakThreads = weakFactor * ns.growthAnalyzeSecurity(growThreads) / ns.weakenAnalyze(1);

		return {
			hackThreads: hackThreads,
			hackWeakThreads: hackWeakThreads,
			growThreads: growThreads,
			growWeakThreads: growWeakThreads
		};
	}
}

/*
Further explanation of growExponent:
If hackPerc = .9 = 90%, then a double-hack will bring the server from 100% to 10% to 1% money -- exponential decay.
If we use a constant factor for grow like with weak, then a 10x grow with a factor of 2 only becomes a 20x grow.
In other words, a constant factor for grow doesn't do much against a double-hack.
By using an exponent for grow, we change the number of hacks we "cancel out".
For example, a growExponent of 2 means that we go from a 10x grow to a 100x grow, fully canceling 2 hacks.
A growExponent of 3 leads to a 1000x grow, canceling 3 hacks.
Obviously, this number gets out of control fast.  A much more conservative 80% hack instead leads to:
100% -> 20% -> 4% money hacked (divided by 5 each time)
5x -> 25x -> 125x grow per growExponent

So, recommended settings in sum:
4 batches for low chance of double-hacks, but lower income.
10 batches for max income but many double-hacks.
4 batches, weakFactor 1.2, growExponent 1, hackPerc .9 for conservative, safe income.
10 batches, weakFactor 2, growExponent 2, hackPerc .8 for higher income, but more RAM use,
and possible runaway security or zeroing out a server.
*/

// trying to compensate for cores. not rly worth it
/* if (action === "grow") {
	threadMult = ns.growthAnalyze(server, 25) /
		ns.growthAnalyze(server, 25, ns.getServer(host).cpuCores);
} else if (action === "weaken") {
	threadMult = ns.weakenAnalyze(threads) /
		ns.weakenAnalyze(threads, ns.getServer(host).cpuCores);
} */

/*
const stockSymbols = {
	"ecorp": "ECP",
	"megacorp": "MGCP",
	"blade": "BLD",
	"clarkinc": "CLRK",
	"omnitek": "OMTK",
	"4sigma": "FSIG",
	"kuai-gong": "KGI",
	"defcomm": "DCOMM",
	"vitalife": "VITA",
	"icarus": "ICRS",
	"univ-energy": "UNV",
	"aerocorp": "AERO",
	"solaris": "SLRS",
	"global-pharm": "GPH",
	"nova-med": "NVMD",
	"lexo-corp": "LXO",
	"rho-construction": "RHOC",
	"alpha-ent": "APHE",
	"syscore": "SYSC",
	"comptek": "CTK",
	"netlink": "NTLK",
	"omega-net": "OMGA",
	"joesguns": "JGN",
	"sigma-cosmetics": "SGC",
	"catalyst": "CTYS",
	"microdyne": "MDYN",
	"titan-labs": "TITN",
	"fulcrumtech": "FLCM",
	"fulcrumassets": "FLCM",
	"stormtech": "STM",
	"helios": "HLS",
	"The-Cave": "HLS",
	"omnia": "OMN",
	"foodnstuff": "FNS",
}
*/

