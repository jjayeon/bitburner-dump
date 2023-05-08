/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname = args._[0];
    if(args.help || !hostname) {
        ns.tprint("This script will generate money by hacking a target server.");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }
    while (true) {
        // await ns.sleep(1000 + 9000 * Math.random());
        if (ns.getServerSecurityLevel(hostname) > ns.getServerMinSecurityLevel(hostname) * 1.5) {
            await ns.weaken(hostname);
        } else if (ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname) * .8) {
            await ns.grow(hostname);
        } else {
            await ns.hack(hostname);
        }
    }
}

