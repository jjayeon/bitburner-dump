/** @param {NS} ns **/
export async function main(ns) {
	while (!ns.gang.inGang()) {
		await ns.sleep(1000);
		return;
	}
	ns.disableLog("ALL");
	const names = [
		"April", "Brandy", "Celine", "Devin", "Emily",
		"Fwinni", "Gwen", "Hrobert", "Isobel", "Joyce",
		"Kylie", "Lauren", // gang count reduced to 12 whoops
		"Mandy", "Nat", "Orange",
		"Pham", "Quyen", "Robert", "Stephanie", "Tian",
		"Ungulate", "Victoria", "Winni", "Xanax", "Youtomia",
		"Zoie", "hwasa", "moonbyul", "solar", "wheein"
	]
	let prevGangStrengths = gangStrengths();
	let tickTime = 20000;
	let lastTick = Date.now();
	let fight = false;
	while (true) {
		await ns.sleep(500);
		const now = Date.now();
		const members = ns.gang.getMemberNames();
		const gangInfo = ns.gang.getGangInformation();
		const otherInfo = ns.gang.getOtherGangInformation();
		if (ns.gang.canRecruitMember()) {
			const name = names.filter(name => !members.includes(name))[0];
			ns.gang.recruitMember(name);
		}
		if (gangInfo.territory < 1 &&
			gangInfo.power >= Math.max(...Object.keys(otherInfo)
				.map((otherGang) => otherInfo[otherGang].power))) {
			ns.gang.setTerritoryWarfare(true);
		} else {
			ns.gang.setTerritoryWarfare(false);
		}
		let currGangStrengths = gangStrengths();
		// ns.print(`${now - lastTick} / ${tickTime}`);
		if (ns.gang.getBonusTime() === 0 &&
			now - lastTick > tickTime - 3000) {
			// ns.print("fight time!");
			fight = true;
		}
		else if (prevGangStrengths !== currGangStrengths) {
			// ns.print("no fight");
			prevGangStrengths = currGangStrengths;
			tickTime = now - lastTick;
			lastTick = now;
			fight = false;
		}
		for (let member of members) {
			const memberInfo = ns.gang.getMemberInformation(member);
			const ascInfo = ns.gang.getAscensionResult(member);
			const ascMult = Math.max(
				memberInfo.agi_asc_mult,
				memberInfo.def_asc_mult,
				memberInfo.dex_asc_mult,
				memberInfo.str_asc_mult)
			const ascendAmt = 3;
			const minStat = Math.min(
				memberInfo.agi,
				memberInfo.def,
				memberInfo.dex,
				memberInfo.str);
			let ascResult = 0;
			if (ascInfo) {
				ascResult = Math.max(
					ascInfo.agi,
					ascInfo.def,
					ascInfo.dex,
					ascInfo.str);
			}
			if ((members.length >= 12 || ascMult < 2) &&
				gangInfo.respect - memberInfo.earnedRespect >= gangInfo.wantedLevel - 1 &&
				ascInfo &&
				ascResult * ascMult - ascMult >= ascendAmt
			) {
				ns.print(`ascending ${member}!!`);
				ns.gang.ascendMember(member);
			} else if (fight) {
				ns.gang.setMemberTask(member, "Territory Warfare");
			} else if (minStat < 50) {
				ns.gang.setMemberTask(member, "Train Combat");
			} else if (members.length < 6) { // hard-coded
				ns.gang.setMemberTask(member, "Mug People");
			} else if (minStat < 300) {
				ns.gang.setMemberTask(member, "Train Combat");
			} else if (gangInfo.respect < gangInfo.wantedLevel) {
				ns.gang.setMemberTask(member, "Vigilante Justice");
			} else if (members.length < 12 ||
				ns.getServerMoneyAvailable("home") > 1e12) { // hard-coded
				ns.gang.setMemberTask(member, "Terrorism");
			} else {
				ns.gang.setMemberTask(member, "Human Trafficking");
				//ns.gang.setMemberTask(member, "Terrorism");
			}
		}
		ns.gang.getEquipmentNames()
			.forEach(equipName => {
				for (let member of members) {
					const memberInfo = ns.gang.getMemberInformation(member);
					const ascMult = Math.max(
						memberInfo.agi_asc_mult,
						memberInfo.def_asc_mult,
						memberInfo.dex_asc_mult,
						memberInfo.str_asc_mult)
					if (ns.gang.getEquipmentType(equipName) === "Augmentation" ||
						ascMult + .1 >= 4) { // floating point error
						if (ns.gang.purchaseEquipment(member, equipName)) {
							ns.print(`purchased ${equipName} for ${member
								} for ${ns.nFormat(ns.gang.getEquipmentCost(equipName), "$0.000a")}`);
							//ns.toast(`purchased ${equipName} for ${member} for ${ns.nFormat(ns.gang.getEquipmentCost(equipName), "$0.000a")}`);
						}
					}
				}
			});
	}
	function gangStrengths() {
		const info = ns.gang.getOtherGangInformation();
		let output = 0;
		for (let gang in info) {
			output += info[gang].power;
		}
		return output;
	}
}

/*
for reference:
["Unassigned",
"Mug People",
"Deal Drugs",
"Strongarm Civilians",
"Run a Con",
"Armed Robbery",
"Traffick Illegal Arms",
"Threaten & Blackmail",
"Human Trafficking",
"Terrorism",
"Vigilante Justice",
"Train Combat",
"Train Hacking",
"Train Charisma",
"Territory Warfare"]
*/
