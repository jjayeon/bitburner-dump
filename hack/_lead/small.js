/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname = args._[0];
    if (args.help || !hostname) {
        ns.tprint(
`This script will generate money by hacking a target server.
USAGE: run ${ns.getScriptName()} SERVER_NAME
Example:
> run ${ns.getScriptName()} n00dles`);
        return;
    }

    let weakChance = .1;
    let growChance = .8;
    while (true) {
        let roll = Math.random();
        if (roll < weakChance) {
            await ns.weaken(hostname);
        } else if (roll < weakChance + growChance) {
            await ns.grow(hostname);
        } else {
            await ns.hack(hostname);
        }
    }
}
