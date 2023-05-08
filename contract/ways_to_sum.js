/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint(waysToSum(ns.args[0], []));
}

export default function waysToSum(n, dp) {
	if (n === 1) return 1;
	if (dp[n]) return dp[n];
	let ways = 0;
	for (let i = 1; i < n / 2; i++) {
		ways += 1 + waysToSum(i, dp) + waysToSum(n-i, dp);
	}
	dp[n] = ways;
	return dp[n];
}
