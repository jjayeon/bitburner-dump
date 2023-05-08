/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];

	async function reset(target) {
		// reset servers to min security and max money
		const currSec = ns.getServerSecurityLevel(target);
		const minSec = ns.getServerMinSecurityLevel(target);
		const currMoney = ns.getServerMoneyAvailable(target);
		const maxMoney = ns.getServerMaxMoney(target);
		const growAmt = maxMoney / currMoney;
		const growThreads = ns.growthAnalyze(target, growAmt === Infinity ? 1e12 : growAmt);
		const weakThreads = (currSec - minSec + ns.growthAnalyzeSecurity(growThreads)) / ns.weakenAnalyze(1)
		if (growThreads > 0) ns.run("/hack/_dir/grow.js", growThreads, target, 0);
		if (weakThreads > 0) ns.run("/hack/_dir/weaken.js", weakThreads, target, 0);
		lockServerFor(target, ns.getWeakenTime(target), "reset");
		await ns.sleep(ns.getWeakenTime(target) + 1000);
	}
	await reset(target);

	const batchesPerSecond = 2;
	const delay = 50;
	const batchTime = 1000 / batchesPerSecond;

	// Excess weaken threads. Increase = increase RAM use, and
	// decrease chance of runaway security level.
	const weakFactor = 2;
	// Excess grow threads. Increase = exponentially increase RAM use, and
	// decrease impact of double-hacks.
	const growExponent = 2;
	// Percent hacked per batch.  Increase = increase income, and
	// increase impact of double-hacks.
	const hackPerc = .8;

	const hackThreads = ns.hackAnalyzeThreads(target, hackPerc * ns.getServerMaxMoney(target));
	const hackWeakThreads = weakFactor * ns.hackAnalyzeSecurity(hackThreads) / ns.weakenAnalyze(1);
	const growThreads = ns.growthAnalyze(target, (1 / (1 - hackPerc)) ** growExponent);
	const growWeakThreads = weakFactor * ns.growthAnalyzeSecurity(growThreads) / ns.weakenAnalyze(1);

	lockServerFor(target, ns.getWeakenTime(target), "cycle");
	for (let timeElapsed = 0; timeElapsed < ns.getWeakenTime(target); timeElapsed += batchTime) {
		await ns.sleep(batchTime);
		ns.run("/hack/_dep/hack.js", hackThreads,
			target, delay,
			timeElapsed);
		ns.run("/hack/_dep/grow.js", growThreads,
			target, delay,
			timeElapsed);
		ns.run("/hack/_dep/weaken.js", hackWeakThreads + growWeakThreads,
			target, delay,
			timeElapsed);
	}

	function lockFile(server) {
		return "/hack/_dep/lock/" + server + ".txt";
	}
	function lockServerFor(server, millis, action) {
		ns.run("/hack/_dir/lock.js", 1, lockFile(server), millis, action);
	}
}

