// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SplitBill.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        SplitBill splitBill = new SplitBill();
        console.log("SplitBill deployed at:", address(splitBill));

        vm.stopBroadcast();
    }
}
