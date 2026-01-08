// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@hashi/adapters/LayerZero/LayerZeroAdapter.sol";
import {SetConfigParam} from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessageLibManager.sol";
import {UlnConfig} from "@layerzerolabs/lz-evm-messagelib-v2/contracts/uln/UlnBase.sol";
import {ILayerZeroEndpointV2} from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";

contract DeployLZAdapter is Script {
    uint32 constant RECEIVE_CONFIG_TYPE = 2;

    function run() external {
        // read deployer key and start broadcasting
        uint256 pk = vm.envUint("DEPLOYER_KEY");
        address deployer = vm.addr(pk);
        address lzEndpoint = vm.envAddress("LZ_ADAPTER_ENDPOINT");
        uint32 eid = uint32(vm.envUint("REPORTER_EID"));
        address reporter = vm.envAddress("LZ_REPORTER_ADDRESS");
        uint256 chainId = vm.envUint("LZ_REPORTER_CHAIN_ID");
        address receiveLib = vm.envAddress("RECEIVE_LIB");

        vm.startBroadcast(pk);
        LayerZeroAdapter adapter = new LayerZeroAdapter(lzEndpoint, deployer);
        console.log("Deployed LayerZeroAdapter at:", address(adapter));

        // Allow the reporter to send messages
        adapter.setPeer(eid, bytes32(uint256(uint160(reporter))));
        // console.log("Reporter allowed as peer");

        // Set reporter as the message sender
        adapter.setReporterByChain(chainId, eid, address(reporter));
        console.log("Reporter set for chainId");
        Set the DVN config as reporter
        address[] memory optionalDVNs = new address[](0);
        address[] memory requiredDVNs = new address[](1);
        requiredDVNs[0] = address(0xa7b5189bcA84Cd304D8553977c7C614329750d99);

        UlnConfig memory uln = UlnConfig({
            confirmations: 15, // minimum block confirmations required
            requiredDVNCount: 1, // number of DVNs required
            optionalDVNCount: 0, // optional DVNs count, uint8
            optionalDVNThreshold: 0, // optional DVN threshold
            requiredDVNs: requiredDVNs, // sorted list of required DVN addresses
            optionalDVNs: optionalDVNs // sorted list of optional DVNs
        });

        bytes memory encodedUln = abi.encode(uln);

        SetConfigParam[] memory params = new SetConfigParam[](1);
        params[0] = SetConfigParam(eid, RECEIVE_CONFIG_TYPE, encodedUln);

        ILayerZeroEndpointV2(lzEndpoint).setConfig(address(adapter), receiveLib, params);
        console.log("Config set successfully.");

        vm.stopBroadcast();
    }
}
