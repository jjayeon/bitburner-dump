import { scriptFuncs, serverFuncs } from "/jjy";

export function autocomplete(data, args) {
	return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
	scriptFuncs(ns);
	serverFuncs(ns);
	const target = ns.args[0] ? ns.args[0] : "n00dles";
	const hosts = ns.jjy.servers.hosts();
	await ns.jjy.scripts.copyAll(hosts, "/hack/_spam/hack.js");
	ns.jjy.scripts.schedule(hosts, "/hack/_spam/hack.js", Infinity, target);
}
