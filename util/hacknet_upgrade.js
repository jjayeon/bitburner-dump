/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	const mult = 1; // ns.getHacknetMultipliers().production;
	while (ns.hacknet.numNodes() === 0) {
		ns.hacknet.purchaseNode();
		await ns.sleep(10);
	}
	while (true) {
		await ns.sleep(100);
		let node;
		let nodeInfo = ns.hacknet.getNodeStats(ns.hacknet.numNodes() - 1);
		let upgradeType = "buy";
		let profit = hashRate(nodeInfo.level, nodeInfo.ramUsed, nodeInfo.ram, nodeInfo.cores, mult) /
			ns.hacknet.getPurchaseNodeCost();
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			const nodeInfo = ns.hacknet.getNodeStats(i);
			const levProfit = upgradeImpact(nodeInfo, "level", mult) / ns.hacknet.getLevelUpgradeCost(i, 1);
			const ramProfit = upgradeImpact(nodeInfo, "ram", mult) / ns.hacknet.getRamUpgradeCost(i, 1);
			const corProfit = upgradeImpact(nodeInfo, "core", mult) / ns.hacknet.getCoreUpgradeCost(i, 1);
			if (levProfit > profit) {
				node = i;
				upgradeType = "level";
				profit = levProfit;
			}
			if (nodeInfo.ram < 8192 && ramProfit > profit) {
				node = i;
				upgradeType = "ram";
				profit = ramProfit;
			}
			if (corProfit > profit) {
				node = i;
				upgradeType = "core";
				profit = corProfit;
			}
		}
		let cost = ns.hacknet.getPurchaseNodeCost();
		switch (upgradeType) {
			case "level": cost = ns.hacknet.getLevelUpgradeCost(node, 1); break;
			case "ram": cost = ns.hacknet.getRamUpgradeCost(node, 1); break;
			case "core": cost = ns.hacknet.getCoreUpgradeCost(node, 1); break;
		}
		ns.print(`want: ${upgradeType} on ${node} for ${ns.nFormat(cost, "$0.000a")}`);
		switch (upgradeType) {
			case "buy": ns.hacknet.purchaseNode(); break;
			case "level": ns.hacknet.upgradeLevel(node, 1); break;
			case "ram": ns.hacknet.upgradeRam(node, 1); break;
			case "core": ns.hacknet.upgradeCore(node, 1); break;
		}
		if (ns.hacknet.numHashes() >= ns.hacknet.hashCapacity()) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				ns.hacknet.upgradeCache(i, 1);
			}
		}
	}
}

function upgradeImpact(nodeInfo, type, mult) {
	const currVal = hashRate(nodeInfo.level, nodeInfo.ramUsed, nodeInfo.ram, nodeInfo.cores, mult);
	// why not use nodeInfo.production? in case there's a bug in hashRate; 
	// this way, we use the same formula to evaluate both no matter what.  slightly more resilient.
	let newVal = currVal;
	switch (type) {
		case "level": newVal = hashRate(nodeInfo.level + 1, nodeInfo.ramUsed, nodeInfo.ram, nodeInfo.cores, mult); break;
		case "ram": newVal = hashRate(nodeInfo.level, nodeInfo.ramUsed, nodeInfo.ram * 2, nodeInfo.cores, mult); break;
		case "core": newVal = hashRate(nodeInfo.level, nodeInfo.ramUsed, nodeInfo.ram, nodeInfo.cores + 1, mult); break;
	}
	return newVal - currVal;
}

function hashRate(level, ramUsed, maxRam, cores, mult) {
	const baseGain = 0.001 * level;
	const ramMultiplier = Math.pow(1.07, Math.log2(maxRam));
	const coreMultiplier = 1 + (cores - 1) / 5;
	const ramRatio = 1 - ramUsed / maxRam;
	return baseGain * ramMultiplier * coreMultiplier * ramRatio * mult;
}
