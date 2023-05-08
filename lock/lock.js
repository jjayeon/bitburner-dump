/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	const filename = ns.args[0];
	const millis = ns.args[1];
	const msg = ns.args[2];
	const start = Date.now();
	if (!ns.fileExists(filename)) {
		await ns.write(filename, start + "\n" + millis + "\n" + msg, "w");
		await ns.sleep(millis);
		ns.rm(filename);
	} else {
		ns.toast("WARNING: lock collision for " + filename, "warning", null);
	}
}

