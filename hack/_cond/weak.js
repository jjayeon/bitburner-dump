/** @param {NS} ns **/
export async function main(ns) {
    let target = ns.args[0];
    let minSec = ns.args[1];
    while (ns.getServerSecurityLevel(target) / minSec > 1.25) {
        await ns.weaken(target);
    }
}
