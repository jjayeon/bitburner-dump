import { serverFuncs } from "/jjy";

export function autocomplete(data, args) {
	return [...data.servers, "weaken", "grow", "hack"];
}

/** @param {NS} ns **/
export async function main(ns) {
	serverFuncs(ns);
	const args = ns.flags([
		["h", false],
		["c", false]
	]);
	if (args.h || args._.length < 2) {
		ns.tprint(`
Count the number of instances of [action] on [target].
Usage: > run ${ns.getScriptName()} ACTION TARGET
`);
		return;
	}
	const action = args._[0];
	const target = args._[1];
	const total = countInstances(action, target, args.c);
	ns.tprint(`Found ${total} ${args.c ? "threads" : "instances"} of ${action} targeting ${target}.`);

	function countInstances(action, target, countThreads = false) {
		const hosts = ns.jjy.servers.hosts();
		let total = 0;
		for (let host of hosts) {
			const count = ns.ps(host)
				.filter(process =>
					process.filename === `/hack/_dir/${action}.js` &&
					process.args[0] === target)
				.reduce((a, b) =>
					a + (countThreads ? b.threads : 1), 0);
			total += count;
		}
		return total;
	}
}
