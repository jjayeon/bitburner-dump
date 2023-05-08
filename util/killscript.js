/** @param {NS} ns **/
export async function main(ns) {
	for (let script of ns.args) {
        ns.scriptKill(script, ns.getHostname());
	}
}
