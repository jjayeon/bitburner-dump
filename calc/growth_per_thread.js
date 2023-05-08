/** @param {NS} ns **/
export async function main(ns) {
	const player = ns.getPlayer();
	player.hacking_grow_mult = 1;
	const megacorp = ns.getServer("megacorp");
	megacorp.moneyAvailable = 0;
	for (let i = 0; i < 20; i++) {
		ns.tprint("2 ** ", i, " threads: ", ns.formulas.hacking.growPercent(megacorp, 2 ** i, player));
	}
}

