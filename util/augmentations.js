/** @param {NS} ns **/
export async function main(ns) {
	buyout(ns.args[0]);
}

function buyout(faction) {
	const augs = ns.getAugmentationsFromFaction(faction);
	augs.sort((a, b) =>
		ns.getAugmentationPrice(b) - ns.getAugmentationPrice(a));
	// const repReq = Math.max(...augs.map(ns.getAugmentationRepReq));
	augs.forEach(aug => ns.purchaseAugmentation(faction, aug));
}
